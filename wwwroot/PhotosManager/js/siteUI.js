
let contentScrollPosition = 0;
let loggedUser;
let EmailError = "";
let PwdError = "";
let VerifyError = "";
let messageVerify = "";
Init_UI();
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Views rendering
function showWaitingGif() {
    eraseContent();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='images/Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
function Init_UI() {
    renderHeaderBase();
    renderLogin();

    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
    $('#loginCmd').on("click", function () {
        renderLogin();
    });
}


function UpdateHeader(string, menu) {
    $("#header").empty();
    if (menu == "logged") {

        if (loggedUser.Authorizations["writeAccess"] == 2) {
            renderHeaderLoggedAdmin();

        }
        else {
            renderHeaderLoggedAdmin();
            $("#manageUserCm").hide();
        }

    }
    else {
        renderHeaderBase();

    }


    $(".viewTitle").text(string);
}


function createProfil(profil) {
    console.log("debut creation profil");
    loggedUser = API.register(profil);

}


function modifyProfil(profil) {
    console.log("debut modification profil");
    API.modifyUserProfil(profil);
}

function renderDeleteSelf() {
    eraseContent();
    UpdateHeader("Retrait de compte", "delete");

    $("#content").append(

        $(`
        <form class="form" id="deleteForm" method="POST">
        <h4>Voulez-vous vraiment supprimer votre compte?</h4>
            <input type='submit' name='delete' id="delete" value="Supprimer" class="form-control btn-primary">
            <div class="cancel">
            <button class="form-control btn-secondary" id="abortCmd">Annuler</button>
            </div>
        </form>

    `));


    $('#deleteForm').on("submit", async function (event) {
        event.preventDefault();


        API.logout();
        API.unsubscribeAccount(loggedUser.Id);

        renderLogin();

    });

    abort = document.getElementById("abortCmd");
    abort.addEventListener("click", function () { renderLogin(); });

}



function renderVerify() {
    eraseContent();
    UpdateHeader("Verification", "verify");

    $("#content").append(

        $(`
        <form class="form" id="verifyForm" method="POST">
        <h4>Veuiller entre le code de vérification que vous avez reçu par courriel</h4>
            <input type='text' name='code' id="code" class="form-control" required RequireMessage='Veuillez entrer votre code' InvalidMessage='Code invalide' placeholder="Code de Verification" value=''>
            <span style='color:red'>${VerifyError}</span>
            <input type='submit' name='submit' id="submitCode" value="Vérifier" class="form-control btn-primary">
        </form>

    `));


    $('#verifyForm').on("submit", async function (event) {
        event.preventDefault();
        let code = document.getElementById("code").value;

        console.log("rentre");

        API.verifyEmail(loggedUser.Id, code);
        showWaitingGif();
        UpdateHeader("Liste des photos", "logged");

    });


}


function renderAbout() {
    timeout();
    saveContentScrollPosition();
    eraseContent();
    UpdateHeader("À propos...", "about");

    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de photos</h2>
                <hr>
                <p>
                    Petite application de gestion de photos multiusagers à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: Nicolas Chourot
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2023
                </p>
            </div>
        `))
}

function renderLogin() {


    UpdateHeader("Login", "login");

    noTimeout(); // ne pas limiter le temps d’inactivité
    eraseContent();// camouffler l’icone de commande d’ajout de photo
    $("#content").append(

        $(`
        <h3></h3>
        <form class="form" id="loginForm" method="POST">
            <span >${messageVerify}</span>
            <input type='email' name='Email' id="Email" class="form-control" required RequireMessage='Veuillez entrer votre courriel' InvalidMessage='Courriel invalide' placeholder="Adresse de courriel" value=''>
            <span style='color:red'>${EmailError}</span>
            <input type='password' name='Password' id="Password" placeholder='Mot de passe' class="form-control" required RequireMessage='Veuillez entrer votre mot de passe'>
            <span style='color:red'>${PwdError}</span>
            <input type='submit' name='submit' id="submit" value="Entrer" class="form-control btn-primary">
        </form>
        <div class="form">
            <hr>
            <button class="form-control btn-info" id="createProfilCmd">Nouveau compte</button>
        </div>
    </div>

    `));

    var createAccount = document.getElementById("createProfilCmd");

    createAccount.addEventListener("click", function () {
        renderInscription();
    });
    $('#loginForm').on("submit", async function (event) {
        event.preventDefault();
        messageVerify = "";
        //Ne rentre pas dans la fonction
        let loginData = getFormData($('#loginForm'));

        // empêcher le fureteur de soumettre une requête de soumission
        showWaitingGif(); // afficher GIF d’attente
        loggedUser = await API.login(loginData.Email, loginData.Password);
        if (loggedUser) {
            console.log("good");

            if (loggedUser.VerifyCode == "verified") {
                UpdateHeader("Liste des photos", "logged");
                API.eraseAccessToken();
            }
            else {
                renderVerify();
            }


        }
        else {
            UpdateHeader("Login", "login");
            if (API.currentStatus == 481) {
                PwdError = "";
                EmailError = "Email introuvable";
            }
            else if (API.currentStatus == 482) {
                EmailError = "";
                PwdError = "Mot de passe introuvable";
            }
            renderLogin();
            $("#Email").text(loginData.Email);

        }




    });
}

function renderInscription() {

    noTimeout(); // ne pas limiter le temps d’inactivité
    eraseContent(); // effacer le conteneur #content
    UpdateHeader("Inscription", "createProfil");
    // camouffler l’icone de commande d’ajout de photo

    $("#content").append(

        $(`<form class="form" id="createProfilForm">
        <fieldset>
        <legend>Adresse de courriel</legend>
        <input type="email" class="form-control Email" name="Email" id="Email" placeholder="Courriel" requiredRequireMessage = 'Veuillez entrer votre courriel'
        InvalidMessage = 'Courriel invalide' required CustomErrorMessage ="Ce courriel est déjà utilisé"/>

        <input class="form-control MatchedInput" type="text" matchedInputId="Email" name="matchedEmail" id="matchedEmail" placeholder="Vérification"
        requiredRequireMessage = 'Veuillez entrez de nouveau votre courriel' required InvalidMessage="Les courriels ne correspondent pas" /></fieldset>

        <fieldset>
        <legend>Mot de passe</legend>
        <input type="password"lass="form-control"name="Password"id="Password"placeholder="Mot de passe" required requiredRequireMessage = 'Veuillez entrer un mot de passe'
        InvalidMessage = 'Mot de passe trop court'/>

        <input class="form-control MatchedInput"type="password" required matchedInputId="Password"name="matchedPassword"id="matchedPassword"placeholder="Vérification" 
        requiredInvalidMessage="Ne correspond pas au mot de passe" />
        </fieldset>

        <fieldset>
        <legend>Nom</legend>
        <input type="text"class="form-control Alpha" required name="Name"id="Name"placeholder="Nom"requiredRequireMessage = 'Veuillez entrer votre nom'
        InvalidMessage = 'Nom invalide'/>
        </fieldset>

        <fieldset>
        <legend>Avatar</legend>
        <div class='imageUploader'newImage='true'controlId='Avatar'imageSrc='images/no-avatar.png'waitingImage="images/Loading_icon.gif"></div>
        </fieldset>

        <input type='submit' name='submit' id='saveUserCmd' value="Enregistrer" class="form-control btn-primary">
    </form>

    <div class="cancel">
    <button class="form-control btn-secondary" id="abortCmd">Annuler</button>
    </div>

`));

    // call back sur clic
    initFormValidation();
    initImageUploaders();
    // call back sur clic
    // ajouter le mécanisme de vérification de doublon de courriel
    //addConflictValidation(API.checkConflictURL(), 'Email', 'saveUser');
    // call back la soumission du formulaire

    $('#createProfilForm').on("submit", function (event) {
        let profil = getFormData($('#createProfilForm'));
        delete profil.matchedPassword;
        delete profil.matchedEmail;
        event.preventDefault();// empêcher le fureteur de soumettre une requête de soumission
        showWaitingGif(); // afficher GIF d’attente
        createProfil(profil); // commander la création au service API

        //on devrait peut etre changer
        renderLogin();
    });

    addConflictValidation(serverHost + '/accounts/conflict', "Email", 'saveUserCmd');

    messageVerify = "Votre compte a été créé. Veuillez prendre vos courriels pour récupérer votre code de vérification qui sera demandé lors de votre prochaine connexion"
    abort = document.getElementById("abortCmd");
    abort.addEventListener("click", function () { renderLogin(); });
}


function renderModifyAccount() {

    noTimeout(); // ne pas limiter le temps d’inactivité
    eraseContent(); // effacer le conteneur #content

    $("#newPhotoCmd").hide(); // camouffler l’icone de commande d’ajout de photo

    $("#content").append(

        $(`
        <form class="form" id="editProfilForm"'>
<input type="hidden" name="Id" id="Id" value="${loggedUser.Id}"/>
<fieldset>
<legend>Adresse de courriel</legend>
<input type="email"
class="form-control Email"
name="Email"
id="Email"
placeholder="Courriel"
required
RequireMessage = 'Veuillez entrer votre courriel'
InvalidMessage = 'Courriel invalide'
required
CustomErrorMessage ="Ce courriel est déjà utilisé"
value="${loggedUser.Email}" >
<input class="form-control MatchedInput"
type="text"
matchedInputId="Email"
name="matchedEmail"
id="matchedEmail"
placeholder="Vérification"
required
RequireMessage = 'Veuillez entrez de nouveau votre courriel'
InvalidMessage="Les courriels ne correspondent pas"
value="${loggedUser.Email}" >
</fieldset>
<fieldset>
<legend>Mot de passe</legend>
<input type="password"
class="form-control"
name="Password"
id="Password"
placeholder="Mot de passe"
required
InvalidMessage = 'Mot de passe trop court' >
<input class="form-control MatchedInput"
type="password"
matchedInputId="Password"
name="matchedPassword"
id="matchedPassword"
placeholder="Vérification"
required
InvalidMessage="Ne correspond pas au mot de passe" >
</fieldset>
<fieldset>
<legend>Nom</legend>
<input type="text"
class="form-control Alpha"
name="Name"
id="Name"
placeholder="Nom"
required
RequireMessage = 'Veuillez entrer votre nom'
InvalidMessage = 'Nom invalide'
value="${loggedUser.Name}" >
</fieldset>
<fieldset>
<legend>Avatar</legend>
<div class='imageUploader'
newImage='false'
controlId='Avatar'
imageSrc='${loggedUser.Avatar}'
waitingImage="images/Loading_icon.gif">
</div>
</fieldset>
<input type='button'
name='submit'
id='saveUserCmd'
value="Enregistrer"
class="form-control btn-primary">
</form>
<div class="cancel">
<button class="form-control btn-secondary" id="abortCmd">Annuler</button>
</div>
<div class="cancel"> <hr>
<button class="form-control btn-warning" id="delete">Effacer le compte</button>
</div>

`));

    // call back sur clic
    initFormValidation();
    initImageUploaders();
    // call back sur clic
    // ajouter le mécanisme de vérification de doublon de courriel
    //addConflictValidation(API.checkConflictURL(), 'Email', 'saveUser');
    // call back la soumission du formulaire

    $('#saveUserCmd').on("click", function (event) {
        console.log("||||||||||||||||||||||||||||||");
        let profil = getFormData($('#editProfilForm'));
        delete profil.matchedPassword;
        delete profil.matchedEmail;
        loggedUser = profil;
        event.preventDefault();// empêcher le fureteur de soumettre une requête de soumission
        showWaitingGif(); // afficher GIF d’attente
        modifyProfil(profil); // commander la création au service API
        API.logout();
        //on devrait peut etre changer
        renderLogin();
    });

    $('#delete').on("click", function (event) {

        renderDeleteSelf();
    });

    addConflictValidation(serverHost + '/accounts/conflict', "Email", 'saveUserCmd');


    abort = document.getElementById("abortCmd");
    abort.addEventListener("click", function () { renderLogin(); });




}


function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

function renderHeaderLoggedAdmin() {

    $("#header").append(
        $(`
         <span title="Liste des photos" id="listPhotosCmd">
                 <img src="images/PhotoCloudLogo.png" class="appLogo">
             </span>
             <span class="viewTitle">Login
                 <div class="cmdIcon fa fa-plus" id="newPhotoCmd" title="Ajouter une photo"></div>
             </span>

             <div class="headerMenusContainer">
                 <span>&nbsp;</span> <!--filler-->
                 <i title="Modifier votre profil">
                     <div class="UserAvatarSmall" userid="${loggedUser.Id}" id="editProfilCmd" style="background-image:url('${loggedUser.Avatar}')" title="Nicolas Chourot"> </div>
                 </i>
                 <div class="dropdown ms-auto">
            <div data-bs-toggle="dropdown" aria-expanded="false">
                <i class="cmdIcon fa fa-ellipsis-vertical"></i>
            </div>
            <div class="dropdown-menu noselect">
                <div class="dropdown-divider"></div>
                <span class="dropdown-item" id="manageUserCm">
                <i class="menuIcon fas fa-user-cog mx-2"></i>
                Gestion des usagers
                </span>
                <div class="dropdown-divider"></div>
                <span class="dropdown-item" id="logoutCmd">
                <i class="menuIcon fa fa-sign-out mx-2"></i>
                Déconnexion
                </span>
                <span class="dropdown-item" id="editProfilMenuCmd">
                <i class="menuIcon fa fa-user-edit mx-2"></i>
                Modifier votre profil
                </span>
                <div class="dropdown-divider"></div>
                <span class="dropdown-item" id="listPhotosMenuCmd">
                <i class="menuIcon fa fa-image mx-2"></i>
                Liste des photos
                </span>
                <div class="dropdown-divider"></div>
                <span class="dropdown-item" id="sortByDateCmd">
                <i class="menuIcon fa fa-check mx-2"></i>
                <i class="menuIcon fa fa-calendar mx-2"></i>
                Photos par date de création
                </span>
                <span class="dropdown-item" id="sortByOwnersCmd">
                <i class="menuIcon fa fa-fw mx-2"></i>
                <i class="menuIcon fa fa-users mx-2"></i>
                Photos par créateur
                </span>
                <span class="dropdown-item" id="sortByLikesCmd">
                <i class="menuIcon fa fa-fw mx-2"></i>
                <i class="menuIcon fa fa-user mx-2"></i>
                Photos les plus aiméés
                </span>
                <span class="dropdown-item" id="ownerOnlyCmd">
                <i class="menuIcon fa fa-fw mx-2"></i>
                <i class="menuIcon fa fa-user mx-2"></i>
                Mes photos
                </span>
                <div class="dropdown-divider"></div>
                <span class="dropdown-item" id="aboutCmd">
                <i class="menuIcon fa fa-info-circle mx-2"></i>
                À propos...
                </span>
                
            </div>
        </div>
             </div>
             `
        ));

    $('#logoutCmd').on("click", function (event) {

        console.log("try logout");
        API.logout();
        renderLogin();
    });



    $('#editProfilMenuCmd').on("click", function (event) {

        renderModifyAccount();
    });
    $('#manageUserCm').on("click", function (event) {
        renderManageUser();
    });



}
function renderHeaderBase() {

    $("#header").append(
        $(`
         <span title="Liste des photos" id="listPhotosCmd">
                 <img src="images/PhotoCloudLogo.png" class="appLogo">
             </span>
             <span class="viewTitle">
                 <div class="cmdIcon fa fa-plus" id="newPhotoCmd" title="Ajouter une photo"></div>
             </span>

             <div class="headerMenusContainer">
                 <span>&nbsp;</span> <!--filler-->
                 
                 <div class="dropdown ms-auto">
            <div data-bs-toggle="dropdown" aria-expanded="false">
                <i class="cmdIcon fa fa-ellipsis-vertical"></i>
            </div>
            <div class="dropdown-menu noselect">
                <div class="dropdown-divider"></div>
                <div class="dropdown-item" id="loginCmd">
                <i class="menuIcon fa fa-sign-in mx-2"></i> Connexion
            </div>
                <div class="dropdown-divider"></div>
                <span class="dropdown-item" id="aboutCmd">
                <i class="menuIcon fa fa-info-circle mx-2"></i>
                À propos...
                </span>
                
            </div>
        </div>
             </div>
             `
        ));

    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
    $('#loginCmd').on("click", function () {
        renderLogin();
    });

}
function renderManageUser() {
    noTimeout(); // ne pas limiter le temps d’inactivité
    eraseContent(); // effacer le conteneur #content
    UpdateHeader("Gestion des usagers", "logged");
    let allUsers = API.GetAccounts();
    console.log(allUsers);
    $("#content").append(
        $(`
        <div class="UserRow" id="UsersContainer">



        </div>
            `
        ));

    allUsers.then(function (result) {


        result.data.forEach(user => {
            let blockedCommand = `<span class="cmdIconVisible blockCmd fa-regular fa-circle greenCmd" blockCmdId="${user.Id}"  title="Bloquer"></span>`;
            let adminCommand = `<span class="cmdIconVisible dodgerblueCmd adminPromoteCmd fas fa-user-alt" promoteCmdId="${user.Id}" title="Promouvoir"></span>`;

            if (user.Authorizations["readAccess"] == 0) {
                blockedCommand = `<span class="cmdIconVisible unblockCmd fa fa-ban redCmd" unblockCmdId="${user.Id}" title="Debloquer"></span>`;
            }
            if (user.Authorizations["writeAccess"] == 2) {
                adminCommand = `<span class="cmdIconVisible dodgerblueCmd adminDemoteCmd fas fa-user-cog" demoteCmdId="${user.Id}"  title="Retirer les droits"></span>`;
            }
            $("#UsersContainer").append(
                $(
                    `<div class="UserContainer noselect" style="width: fit-content;">
                            <div class="UserLayout" style:"width:400px;">
                                <div> <img src="${user.Avatar}" alt="" class="UserAvatar"></div>
                                <div class="UserInfo">
                                    <div class="UserName">${user.Name}</div>
                                    <div class="UserEmail">${user.Email}</div>
                
                                </div>     
                            </div>
                            <div class="UserCommandPanel">
                                ${adminCommand}
                                ${blockedCommand}
                                <span class="cmdIconVisible deleteCmd fas fa-user-slash goldenrodCmd " deleteId="${user.Id}"  title="Delete user"></span>
                            </div>
                        </div>
                            
                            
                            
                            
                            `
                )
            )

            $(".adminPromoteCmd").on("click", function () {
                saveContentScrollPosition();
                //console.log(result.data.find((user) => { return user["Id"] == $(this).attr("promoteCmdId") }));

                let UpdateProfil = result.data.find((user) => { return user["Id"] == $(this).attr("promoteCmdId") });
                UpdateProfil.Authorizations["readAccess"] = 2;
                UpdateProfil.Authorizations["writeAccess"] = 2;
                UpdateProfil.Avatar = UpdateProfil.Avatar.toString().slice(39,UpdateProfil.Avatar.length);
                console.log(UpdateProfil);
                modifyProfil(UpdateProfil);
                renderManageUser();
            });
            $(".adminDemoteCmd").on("click", function () {
                saveContentScrollPosition();
                let UpdateProfil = result.data.find(user => user["Id"] == $(this).attr("demoteCmdId"));
                UpdateProfil.Authorizations["readAccess"] = 1;
                UpdateProfil.Authorizations["writeAccess"] = 1;
                modifyProfil(UpdateProfil).then(() => {
                    renderManageUser();
                });
            });
            $(".deleteCmd").on("click", function () {
                saveContentScrollPosition();
                renderDeleteForm($(this).attr("deleteId"));
            });
            $(".unblockCmd").on("click", function () {
                saveContentScrollPosition();
                let UpdateProfil = result.data.find(user => user["Id"] == $(this).attr("unblockCmdId"));
                UpdateProfil.Authorizations["readAccess"] = 1;
                UpdateProfil.Authorizations["writeAccess"] = 1;
                modifyProfil(UpdateProfil).then(() => {
                    renderManageUser();
                });
            });
            $(".blockCmd").on("click", function () {
                saveContentScrollPosition();
                console.log(result.data);
                let UpdateProfil = result.data.find(user => user["Id"] == $(this).attr("blockCmd"));
                UpdateProfil.Authorizations["readAccess"] = 0;
                UpdateProfil.Authorizations["writeAccess"] = 0;
                modifyProfil(UpdateProfil).then(() => {
                    renderManageUser();
                });
            })
        });
    });

}
function renderDeleteForm(id) {
    eraseContent();
    UpdateHeader("Retrait de compte", "delete");

    $("#content").append(

        $(`
        <form class="form" id="deleteForm" method="POST">
        <h4>Voulez-vous vraiment supprimer ce compte?</h4>
            <input type='submit' name='delete' id="delete" value="Supprimer" class="form-control btn-primary"><br>
            <div class="cancel">
            <button class="form-control btn-secondary" id="abortCmd">Annuler</button>
            </div>
        </form>

    `));


    $('#deleteForm').on("submit", async function (event) {
        event.preventDefault();


        API.unsubscribeAccount(id);

        renderManageUser();
    });
}