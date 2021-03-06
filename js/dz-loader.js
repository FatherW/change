// import { PolymerElement, html } from '/node_modules/@polymer/polymer/polymer-element.js';
import '/node_modules/@vaadin/vaadin-dialog/vaadin-dialog.js';
import { Dazzle } from '/node_modules/@dazzle/dz-dazzle/dz-library.js';

import '/node_modules/change/change-header.js';
import '/node_modules/change/change-footer.js';
import '/node_modules/change/change-youtube.js';
// import './change-user-panel.js';


// Get TV global function
        Dazzle.encryptToken =function(json){
                // Generate token
                let length = 15;
                var token           = '';
                var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                var charactersLength = characters.length;
                for ( var i = 0; i < length; i++ ) {
                    token += characters.charAt(Math.floor(Math.random() * charactersLength));
                }

                let tokenManager = new DataPackage("token");
                // let json = {
                //         "id": id,
                //         "orderID": this.order,
                //         "seller": this.seller,
                //         "buyer": this.user,
                //         "product": this.product
                // } 
                // this.tokenManager.saveDataWithCache(id,json);
                json['expireDate'] = new Date().getTime() + 1000*3600*24;
                var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(json),token).toString();
                console.log('Cipher',ciphertext);
                tokenManager.saveData(token,{'ciphertext': ciphertext});

                return token;
               
            };

        Dazzle.decryptToken = function(id){

                let tokenManager = new DataPackage("token");
                return new Promise(function(resolve, reject) {
                    tokenManager.loadData(id).then(res=>{
                        let ciphertext = res.ciphertext;
                        // Decrypt
                        console.log('Ciphertext',res,res.ciphertext);
                        var bytes  = CryptoJS.AES.decrypt(ciphertext, id);
                        var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                        resolve(decryptedData);
                    },err=>{
                        reject();
                    });
                });
            };

        Dazzle.saveDataWithPage = function(table,id,alias){
            let dataManager = new DataPackage(table);

                let that = this;

                    let html = document.createElement('html');
                    let head = document.createElement('head');
                    let body = document.createElement('body');

                    let meta = document.createElement('meta');
                    meta.setAttribute('name',table+'-id');
                    meta.setAttribute('content',id);
                    Dazzle.getContent('/'+table+'.html').then(content=>{
                        let parser = new DOMParser();
                        let doc = parser.parseFromString(content, "text/html");
                    
                        head.innerHTML = doc.head.innerHTML;
                        body.innerHTML = doc.body.innerHTML;
                        // body.innerHTML = 
                        console.log('HTML',head.innerHTML,body.innerHTML);

                        head.appendChild(meta);
                        html.appendChild(head);
                        html.appendChild(body);
                        this.fileManager.saveHtml(table+'/'+alias,html.outerHTML);
                        // this.dataManager.getDataByCache(id).then(res=>{
                        //     res['alias'] = alias;
                        //     this.dataManager.saveDataWithCache(id,res);
                        // });

                    });
            }

    // Get TV License and Initialization
    Dazzle.loadChangeComponent = function(cat, id) {


        let isReg =   customElements.get(id);
    
    //        if (!com){
    
            if (!isReg){
                let local = this.dzLicense["local"] || false;
                let base;
                base = '/';
                let html =
                    '<script type="module" src=' +
                    base +
                    "node_modules/" +
                    cat +
                    "/" +
                    id +
                    ".js?id=" +
                    new Date().getTime() +
                    '"></script>';
                let item = document.createRange().createContextualFragment(html);
                document.head.appendChild(item);
            }
    
        };
    
Dazzle.getProductModel = function(){

    let model =  {
        "categories": "",
        "sellerMsg": "",
        "productname": "",
        "price": 10,
        "district": "",
        "deliveryMethod": "面交",
        "descrip": "",
        "tag": [],
        "deliveryDesc": "",
        "isNew": true,
        "isFree": false,
        "ownerId": null,
        "pics": ["http://change.dazzle.website.s3.amazonaws.com/files/1/1591944377549.jpeg"],
        'replyArray':[],
        'alias': '',
        "postStatus":false,
        "isPurchase": false
    };
    return model;
}

   let dzLicense = {
        "uid":"change",
        "tid":"change",
        "userBucket":"change.dazzle.website",
        "expiryDate":"Mar 25 2021",
        "userType":"normal",
        "token":"",
        "init":false,
        "local":false
    };
    let subUser = store.get('change-user') || null;
console.log('Sub User',subUser);
    Dazzle.subUser =subUser;

    let editMode = store.get("editMode") || "normal";
    let elm;
    let thisPage =
        decodeURIComponent(location.pathname).substring(
            location.pathname.indexOf("/") + 1
        ) || "index.html";
        
    store.set('subUser',subUser);
    console.log('Sub User',subUser);
    // if (subUser)
    //     Dazzle.loadScript("https://d25k6mzsu7mq5l.cloudfront.net/cdn6.0/js/aws-sdk-2.83.0.min.js");
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


    if (subUser)
        Dazzle.fileManager = new AwsPackage(subUser);
    else if (user)
        Dazzle.fileManager = new AwsPackage(user);

    console.log('User',subUser,user,Dazzle.fileManager);

        console.log('Edit Mode',editMode);


// Load Admin mode and Normal mode Dazzle's component

        if (editMode === "admin") {

            Dazzle.fileManager = new AwsPackage(user);
            Dazzle.dataManager = new DataPackage("_info");
            Dazzle.user = user;
            Dazzle.websiteUrl = Dazzle.user["websiteUrl"] || "//" + Dazzle.userBucket + "/";
            Dazzle.loadPage();





        } else {
            Dazzle.dataManager = new DataPackage("_info");
            Dazzle.websiteUrl = location.hostname;

            // Load dz-dazzle Component
            Dazzle.loadComponent("dz-dazzle", "dz-dazzle");
            let dzDazzle = document.createElement('dz-dazzle');
            document.body.appendChild(dzDazzle);


            // let elm = document.createElement('dz-wrapper');
            // let html = document.body.innerHTML;
            // html = html.trim();
            // if (!html) {
            //     document.body.appendChild(elm);
            // }
        }


