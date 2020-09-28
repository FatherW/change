import {Dazzle} from 'https://d25k6mzsu7mq5l.cloudfront.net/node_modules/@dazzle/dz-dazzle/dz-library.js';

   let dzLicense = {
        "uid":"change",
        "tid":"change",
        "userBucket":"change.dazzle.website",
        "expiryDate":"Mar 25 2021",
        "userType":"normal",
        "token":"",
        "init":false,
        "local":"false"
    };

    console.log('DZ DZ-license');
    let subUser = store.get(dzLicense['uid']+'-user') || null;
   
    let editMode = store.get("editMode") || "normal";
    let elm;
    let thisPage =
        decodeURIComponent(location.pathname).substring(
            location.pathname.indexOf("/") + 1
        ) || "index.html";
        
    store.set('subUser',subUser);
    Dazzle.dzLicense = dzLicense;
    Dazzle.uid = dzLicense['uid'];
    Dazzle.tid = dzLicense["tid"];
    Dazzle.userBucket = dzLicense["userBucket"];
    Dazzle.userType = Dazzle.dzLicense["userType"] || "normal";
    Dazzle.thisPage = thisPage;
    store.set('dzLicense', Dazzle.dzLicense);

    Dazzle.editMode = editMode;
    let user = store.get('user') || null;
    if (user){
        user['userBucket'] = Dazzle.dzLicense['userBucket'];
        user['tid'] = Dazzle.dzLicense['tid'];
    } else {
        user = dzLicense;
        store.set('user',user);
    }

    Dazzle.user = user;
    console.log('Sub User',subUser);
    if (subUser)
        Dazzle.fileManager = new AwsPackage(subUser);
    else if (user)
        Dazzle.fileManager = new AwsPackage(user);

    console.log('User',subUser,user,Dazzle.fileManager);

    Dazzle.subUser = store.get('subUser') || null;
    console.log('Edit Mode',editMode);


// Load Admin mode and Normal mode Dazzle's component

    if (editMode === "admin") {
        Dazzle.loadComponent('dz-dazzle','dz-admin');
        Dazzle.user = user;
        Dazzle.websiteUrl = Dazzle.user["websiteUrl"] || "//" + Dazzle.userBucket + "/";
        Dazzle.loadPage();
        console.log('Admin');

        console.log('Admin 2');



    } else {
        Dazzle.websiteUrl = location.hostname;
        // Load dz-dazzle Component
        Dazzle.loadComponent('dz-dazzle','dz-dazzle');
        let dzDazzle = document.createElement('dz-dazzle');
        document.body.appendChild(dzDazzle);        
    }

