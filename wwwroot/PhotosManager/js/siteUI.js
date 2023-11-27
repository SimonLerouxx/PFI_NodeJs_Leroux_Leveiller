let contentScrollPosition = 0;
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
function UpdateHeader(string,menu) {
    $("#newPhotoCmd").hide();
    $(".viewTitle").text( string);
    
}
function renderHeader(){
    
    $("#header").append(
        $( `
         <span title="Liste des photos" id="listPhotosCmd">
                 <img src="images/PhotoCloudLogo.png" class="appLogo">
             </span>
             <span class="viewTitle">Login
                 <div class="cmdIcon fa fa-plus" id="newPhotoCmd" title="Ajouter une photo"></div>
             </span>
             <div class="headerMenusContainer">
                 <span>&nbsp;</span> <!--filler-->
                 <i title="Modifier votre profil">
                     <div class="UserAvatarSmall" userid="" id="editProfilCmd" style="background-image:url(')" title="Nicolas Chourot"></div>
                 </i>
                 <div class="dropdown ms-auto dropdownLayout">
                     <!-- Articles de menu -->
                 </div>
             </div>
             `
     ))
     $("#newPhotoCmd").hide();
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
    noTimeout(); // ne pas limiter le temps d’inactivité
    eraseContent();
    
    
    UpdateHeader("Login","??")
    $("#newPhotoCmd").hide(); // camouffler l’icone de commande d’ajout de photo
    $("#content").append(

        $(`
        <h3>LOGIN</h3>
        <form class="form" id="loginForm" method="POST">
            <input type='email' name='Email' id="Email" class="form-control" required RequireMessage='Veuillez entrer votre courriel' InvalidMessage='Courriel invalide' placeholder="Adresse de courriel" value=''>
            <span style='color:red'></span>
            <input type='password' name='Password' id="Password" placeholder='Mot de passe' class="form-control" required RequireMessage='Veuillez entrer votre mot de passe'>
            <span style='color:red'></span>
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

}

function renderInscription() {

    noTimeout(); // ne pas limiter le temps d’inactivité
    eraseContent(); // effacer le conteneur #content
    UpdateHeader("Inscription","createProfil");
    $("#newPhotoCmd").hide(); // camouffler l’icone de commande d’ajout de photo

    $("#content").append(

        $(`<form class="form" id="createProfilForm" method="POST">
        <fieldset>
        <legend>Adresse de courriel</legend>
        <input type="email" class="form-control Email"name="Email"id="Email"placeholder="Courriel"requiredRequireMessage = 'Veuillez entrer votre courriel'
        InvalidMessage = 'Courriel invalide'CustomErrorMessage ="Ce courriel est déjà utilisé"/>

        <input class="form-control MatchedInput"type="text"matchedInputId="Email"name="matchedEmail"id="matchedEmail"placeholder="Vérification"
        requiredRequireMessage = 'Veuillez entrez de nouveau votre courriel'InvalidMessage="Les courriels ne correspondent pas" /></fieldset>

        <fieldset>
        <legend>Mot de passe</legend>
        <input type="password"lass="form-control"name="Password"id="Password"placeholder="Mot de passe"requiredRequireMessage = 'Veuillez entrer un mot de passe'
        InvalidMessage = 'Mot de passe trop court'/>

        <input class="form-control MatchedInput"type="password"matchedInputId="Password"name="matchedPassword"id="matchedPassword"placeholder="Vérification" 
        requiredInvalidMessage="Ne correspond pas au mot de passe" />
        </fieldset>

        <fieldset>
        <legend>Nom</legend>
        <input type="text"class="form-control Alpha"name="Name"id="Name"placeholder="Nom"requiredRequireMessage = 'Veuillez entrer votre nom'
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
$('#loginForm').on("submit", async function (event) {

    //Ne rentre pas dans la fonction
    console.log("in login");
    let loginData = getFormData($('#loginForm'));
    console.log(loginData);
    
    event.preventDefault();// empêcher le fureteur de soumettre une requête de soumission
    showWaitingGif(); // afficher GIF d’attente


    let result = await API.login(loginData.Email,loginData.Password);
    console.log(result);
});


    //$('#loginCmd').on('click', renderLoginForm); // call back sur clic

    initFormValidation();
    initImageUploaders();
   // $('#abortCmd').on('click', renderLoginForm); // call back sur clic
    // ajouter le mécanisme de vérification de doublon de courriel
        //addConflictValidation(API.checkConflictURL(), 'Email', 'saveUser');
    // call back la soumission du formulaire

    $('#createProfilForm').on("submit", async function (event) {

        //Ne rentre pas dans la fonction
        console.log("in");
        let profil = getFormData($('#createProfilForm'));
        console.log(profil);
        delete profil.matchedPassword;
        delete profil.matchedEmail;
        event.preventDefault();// empêcher le fureteur de soumettre une requête de soumission
        showWaitingGif(); // afficher GIF d’attente


        let result = await API.register(profil);
        console.log(result);
    });


    abort = document.getElementById("abortCmd");
    abort.addEventListener("click", function () { renderLogin(); });
}

