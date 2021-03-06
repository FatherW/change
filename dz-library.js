/* <link rel="import" href="../polymer/Dazzle.html" />
<link rel="import" href="default-package/default-package.html" />
<script src="https://d25k6mzsu7mq5l.cloudfront.net/cdn6.0/js/store-2.0.12.min.js"></script>
<link rel="stylesheet" href="https://d25k6mzsu7mq5l.cloudfront.net/cdn6.0/css/font-awesome-4.7.0.min.css" /> */

import "./js/store-2.0.12.min.js";

// import AWS object without services
// import individual service
// import S3 from '/node_modules/aws-sdk/clients/s3';

import "https://cdnjs.cloudflare.com/ajax/libs/aws-sdk/2.734.0/aws-sdk.min.js";


window.store = store;
    
    let AwsPackage = class {
        constructor(user) {
            //        const user = window['user'] || store.get('user') || null;

            let that = this;
            console.log(user);
            this.key = user["key"] || null;
            this.miscUrl =
                "https://41khtanrje.execute-api.ap-northeast-1.amazonaws.com/prod/dazzleEditorMiscFunction";
            console.log("AWS User", user);
            this.bucket = user["userBucket"];
            this.user = user;

            // let AWS = window["AWS"];
            let thisPage = store.get("thisPage") || "index.html";
            AWS.config = new AWS.Config();
            if (this.key) {
                AWS.config.accessKeyId = this.key["AccessKeyId"];
                AWS.config.secretAccessKey = this.key["SecretAccessKey"];
                AWS.config.sessionToken = this.key["SessionToken"];
                AWS.config.region = "ap-northeast-1";
            }

            window["AWS"] = AWS;
            this.AWS = AWS;
            console.log("AWS", AWS);

        }
        getExternalContent(url) {
            let miscFcUrl =
                "https://41khtanrje.execute-api.ap-northeast-1.amazonaws.com/prod/dazzleEditorMiscFunction";
            let params = {
                url: url,
                action: "grabPage",
            };
            let that = this;
            return new Promise(function(resolve, reject) {
                that.postData(miscFcUrl, params).then((result) => {
                    resolve(result.resolve);
                });
            });
        }
        listObjectVersions(key) {
            let AWS = window["AWS"];
            let that = this;
            return new Promise(function(resolve, reject) {
                var s3 = new AWS.S3();
                var params = {
                    Bucket: that.bucket,
                    Prefix: key
                        // Prefix: prefix
                };
                s3.listObjectVersions(params, function(err, data) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data.Versions);
                    }
                });
            });


        }

        saveImageTags(id, tags) {
            let table = this.table;
            let dbUrl =
                "https://41khtanrje.execute-api.ap-northeast-1.amazonaws.com/prod/Dazzle-elasticSearchController";
            let that = this;
            let json = {
                action: "addData",
                index: "gallery",
                type: "table",
                id: id,
                body: {
                    tags: tags,
                },
            };
            console.log(JSON.stringify(json));
            return new Promise(function(resolve, reject) {
                Dazzle.postData(dbUrl, json).then((result) => {
                    console.log(result);
                    if (result.code < 0) {
                        resolve({});
                    } else {
                        resolve(result.resolve);
                    }
                });
            });
        }
        saveExternalContent(url, thisPath) {
            let that = this;

            console.log("Save Url", url);
            if (url.indexOf("//") >= 0) {
                this.getExternalContent(url).then((res) => {
                    that.saveFile(thisPath, res);
                });
            }
        }
        grabPage(url) {
            let that = this;
            let params = {
                action: "grabPage",
                url: url,
            };
            console.log("Grab URL", url);
            return new Promise(function(resolve, reject) {
                that.postData(that.miscUrl, params).then((result) => {
                    console.log(result);
                    if (result.code < 0) {
                        resolve({});
                    } else {
                        resolve(result.resolve);
                    }
                });
            });
        }

        saveImage(url, path) {
            let that = this;
            let params = {
                action: "saveImage",
                url: url,
                bucket: this.bucket,
                path: path,
            };
            return new Promise(function(resolve, reject) {
                that.postData(that.miscUrl, params).then((result) => {
                    console.log(result);
                    if (result.code < 0) {
                        resolve({});
                    } else {
                        resolve(result.resolve);
                    }
                });
            });
        }
        getData(url, data) {
            // Default options are marked with *
            let newUrl = url + "?" + data;
            return new Promise(function(resolve, reject) {
                fetch(newUrl, {
                    // body: JSON.stringify(data), // must match 'Content-Type' header
                    // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                    // credentials: 'same-origin', // include, same-origin, *omit
                    headers: {
                        "x-product": "DazzleStock",
                        "x-api-key": "d9b126638ff44a84a0145c89a8c8ee01",
                    },
                    mode: "no-cors", // no-cors, cors, *same-origin

                    method: "GET", // *GET, POST, PUT, DELETE, etc.
                    // mode: 'cors', // no-cors, cors, *same-origin
                    // redirect: 'follow', // manual, *follow, error
                    // referrer: 'no-referrer', // *client, no-referrer
                }).then((response) => {
                    resolve(response);
                }); // parses response to JSON
            });
        }

        postData(url, data) {
            // Default options are marked with *

            return new Promise(function(resolve, reject) {
                fetch(url, {
                    body: JSON.stringify(data), // must match 'Content-Type' header
                    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
                    credentials: "same-origin", // include, same-origin, *omit
                    headers: {
                        "content-type": "application/json",
                    },
                    method: "POST", // *GET, POST, PUT, DELETE, etc.
                    mode: "cors", // no-cors, cors, *same-origin
                    redirect: "follow", // manual, *follow, error
                    referrer: "no-referrer", // *client, no-referrer
                }).then((response) => {
                    resolve(response.json());
                }); // parses response to JSON
            });
        }
        parseThisPage(html) {
            let parser = new DOMParser();
            let doc = parser.parseFromString(html, "text/html");
            //this.document = doc;
            return doc;
            // console.log('Parse',doc);
        }

        loadScript(url) {
            const fileref = document.createElement("script");
            fileref.setAttribute("type", "text/javascript");
            fileref.setAttribute("src", url);
            fileref.setAttribute('type','module');
            document.getElementsByTagName("head")[0].appendChild(fileref);
        }

        
        rootManagedUpload(key, body) {
            // let tags = key.split("/");
             let AWS = this.AWS;
            console.log('Path',key);
            const params = {
                Bucket: this.bucket,
                Key: key,
                Body: body,
                ContentType:"text/html"
            };

            let ext;
            if (key.indexOf(".") > -1) ext = key.substr(key.lastIndexOf(".") + 1);
            else ext = "";
            if (ext === "css") {
                params.ContentType = "text/css";
            } else if (ext === "less") {
                params.ContentType = "text/css";
            } else if (ext === "js") {
                params.ContentType = "application/javascript";
            } else if (ext === "json") {
                params.ContentType = "application/json";
            } else if (ext === "jpg") {
                params.ContentType = "image/jpeg";
            } else if (ext === "jpeg") {
                params.ContentType = "image/jpeg";
            } else if (ext === "png") {
                params.ContentType = "image/png";
            } else if (ext === "gif") {
                params.ContentType = "image/gif";
            } else if (ext === "html") {
                params.ContentType = "text/html";
            } else {
                params.ContentType = "text/html";
            }

            
             const s3 = new AWS.S3();
             console.log(AWS);
             return s3.upload(params);
             // return s3.ManagedUpload(json);
        }

        myManagedUpload(key, body) {
           // let tags = key.split("/");
            let AWS = this.AWS;
            //tags.pop();

            const json = {
                Bucket: this.bucket,
                Key: "files/" + key,
                Body: body,
            };
            console.log(json);
            const s3 = new AWS.S3();
            console.log(AWS);
            return s3.upload(json);
            // return s3.ManagedUpload(json);
        }
        listAllFiles() {
            // const bucket = this.user.myUser['userBucket'];
            // const bucket = this.user.myUser['userBucket'];
            let AWS = window["AWS"];
            let that = this;
            return new Promise(function(resolve, reject) {
                var s3 = new AWS.S3();
                var params = {
                    Bucket: that.bucket,
                    Delimiter: "/",
                    // Prefix: prefix
                };
                s3.listObjects(params, function(err, data) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data.Contents);
                    }
                });
            });
        }

        listAllFolders(prefix) {
            // const bucket = this.user.myUser['userBucket'];
            // const bucket = this.user.myUser['userBucket'];
            let AWS = window["AWS"];
            let that = this;
            return new Promise(function(resolve, reject) {
                var s3 = new AWS.S3();
                var params = {
                    Bucket: 'dazzle-template',
                    Delimiter: "/",
                    Prefix: "user-data/" + Dazzle.uid + "/template/" + Dazzle.uid + "/" + prefix + "/"
                };
                s3.listObjects(params, function(err, data) {
                    console.log('data', data)
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            });
        }
        listFile(prefix) {
            // const bucket = this.user.myUser['userBucket'];
            // const bucket = this.user.myUser['userBucket'];
            let AWS = window["AWS"];
            let that = this;
            return new Promise(function(resolve, reject) {
                var s3 = new AWS.S3();
                var params = {
                    Bucket: that.bucket,
                    Prefix: prefix,
                };
                s3.listObjects(params, function(err, data) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data.Contents);
                    }
                });
            });
        }
        saveMyImageByUrl(url) {
            function dataURItoBlob(dataURI) {
                var binary = atob(dataURI.split(",")[1]);
                var array = [];
                for (var i = 0; i < binary.length; i++) {
                    array.push(binary.charCodeAt(i));
                }
                return new Blob([new Uint8Array(array)], {
                    type: "image/jpeg"
                });
            }
            let AWS = this.AWS;
            const uid = Dazzle.user["uid"];
            var blobData = dataURItoBlob(url);
            const fileExtansion = "jpg";
            const newId = "id" + new Date().getTime();
            const newFilename = newId + ".jpg";
            const s3 = new AWS.S3();
            var params = {
                Bucket: "designerrrr",
                Key: "images/" + uid + "/" + newFilename,
                ContentType: "image/jpeg",
                Body: blobData,
                Metadata: {
                    newVersion: "new",
                    gid: newId,
                    owner_id: uid,
                    original_name: newFilename,
                    galleryType: "photo",
                    tags: "",
                },
                // Key: newFilename, ContentType: 'image/jpeg', Body: blobData
            };
            console.log("Params", params);

            return new Promise(function(resolve, reject) {
                s3.upload(params, function(err, data) {
                    console.log(err, data);
                    if (err) {
                        reject(err);
                    } else {
                        resolve(newId);
                    }
                });
            });
        }

        changeFilename(name) {
            let ext;
            if (name.indexOf(".") > -1) ext = name.substr(name.lastIndexOf(".") + 1);
            else ext = "";

            let filename = Dazzle.uid + '-' + new Date().getTime() + '.' + ext;
            return filename;

        }
        saveMyImage(name, file, tags = "") {
            console.log(file);
            let AWS = this.AWS;
            // console.log(this.user);
            const uid = this.user["uid"];
            console.log(uid);
            //    if (!subowner)
            //        subowner=''
            const s3 = new AWS.S3();

            // const oldFilename = encodeURIComponent(file.name);
            // const fileExtansion = oldFilename.split('.').pop();
            const oldFilename = name;
            const fileExtansion = "jpg";
            const newId = "id" + new Date().getTime();
            const newFilename = newId + ".jpg";
            const params = {
                Bucket: "designerrrr",
                Key: "images/" + uid + "/" + newFilename,
                ContentType: "image/jpeg",
                Body: file,
                Metadata: {
                    newVersion: "new",
                    gid: newId,
                    owner_id: uid,
                    original_name: oldFilename,
                    galleryType: "photo",
                    tags: tags,
                },
            };
            console.log("Params", params);

            return new Promise(function(resolve, reject) {
                s3.upload(params, function(err, data) {
                    console.log(err, data);
                    if (err) {
                        reject(err);
                    } else {
                        resolve(newId);
                    }
                });
                // s3.putObject(params, function (err, data) {
                //     if (err) {
                //         reject(err);
                //     } else {
                //         resolve(newId);
                //     }
                // });
            });
        }

        isBucketExist(bucket) {
            let AWS = this.AWS;
            return new Promise(function(resolve, reject) {
                let s3 = new AWS.S3();

                let params = {
                    Bucket: bucket,
                };
                s3.headBucket(params, function(err, data) {
                    if (err) resolve(false);
                    // an error occurred
                    else resolve(true); // successful response
                });
            });
        }
        copyPage(srcPage, destPage) {
            // let 
            let srcPath = "template/" + Dazzle.tid + "/" + srcPage;
            let destPath = "template/" + Dazzle.tid + "/" + destPage;
            Promise.all([

                // Dazzle.getUserDataContent(masterPath+'/css'),
                // Dazzle.getUserDataContent(masterPath+'/css'),
                Dazzle.getUserDataContent(srcPath + '/body_js'),
                Dazzle.getUserDataContent(srcPath + '/html'),
                Dazzle.getUserDataContent(srcPath + '/body_class'),
                Dazzle.getUserDataContent(srcPath + '/head'),
                Dazzle.getUserDataContent(srcPath + '/css')
            ]).then(res => {

                let bodyJs = res[0];
                let html = res[1];
                let bodyClass = res[2];
                let head = res[3];
                let css = res[4];
                console.log(res);
                this.saveUserData(destPath + '/head', head);
                this.saveUserData(destPath + '/css', css);
                this.saveUserData(destPath + '/html', html);
                this.saveUserData(destPath + '/body_js', bodyJs);
                this.saveUserData(destPath + '/body_class', bodyClass);

            });
        }
        copyFile(copySource, key) {
            let AWS = this.AWS;
            let bucket = this.bucket;
            return new Promise(function(resolve, reject) {
                var s3 = new AWS.S3();
                var params = {
                    Bucket: bucket,
                    Key: key,
                    CopySource: encodeURIComponent(copySource),
                };
                s3.copyObject(params, function(err, data) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            });
        }

        copyFolder(src, dest) {
            console.log("Copy Folder");
            let that = this;
            let bucket = this.bucket;
            let AWS = this.AWS;
            return new Promise(function(resolve, reject) {
                var s3 = new AWS.S3();
                var params = {
                    Bucket: bucket,
                    Prefix: src,
                };
                s3.listObjects(params, function(err, data) {
                    if (err) reject();

                    console.log("Data", data);
                    var count = 0;
                    data.Contents.forEach(function(content) {
                        var str = content.Key;
                        str = str.replace(src, dest);

                        that.getFile(content.Key).then(
                            function(data2) {
                                console.log("Data2", data2);
                                that.saveFile(str, data2).then(
                                    function(data3) {
                                        count++;
                                        console.log("Count", count);
                                        console.log(data.Contents.length);
                                        if (count == data.Contents.length) resolve(data3);
                                    },
                                    function() {
                                        reject();
                                    }
                                );
                            },
                            function() {
                                reject();
                            }
                        );
                    });
                });
            });
        }

        getUserData(key, string) {
                let that = this;
                let AWS = this.AWS;
                let bucket = this.bucket;
                // let AWS = window['AWS'];

                // console.log(window,window['AWS']);
                return new Promise(function(resolve, reject) {
                    let s3 = new AWS.S3();
                    let params = {
                        Bucket: 'dazzle-template',
                        Key: 'user-data/' + Dazzle.uid + '/' + key,
                        ResponseExpires: new Date().getTime(),
                    };
                    console.log("Get File", params);
                    s3.getObject(params, function(err, data) {
                        console.log("Data", params, data);
                        if (err) {
                            resolve('');
                            // reject(err);
                        } else {
                            resolve(data.Body.toString());
                        }
                    });
                });
            }
            // Dazzle.getUserDataContent = function(path) {
            //     let url =
            //         "https://d25k6mzsu7mq5l.cloudfront.net/user-data/" +
            //         Dazzle.uid +
            //         "/" +
            //         path+'?='+ new Date().getTime();

        //     console.log("Query Url", url);
        //     return new Promise(function(resolve, reject) {
        //         fetch(url)
        //             .then((response) => {
        //                 if (!response.ok) {
        //                     resolve('');
        //                 } else resolve(response.text());
        //             })
        //             .catch((error) => {
        //                 console.error("Error:", error);
        //                 // reject();
        //                 resolve('');
        //             });
        //     });
        // };

        removeUserData(key) {
            let AWS = this.AWS;
            // console.log(window['AWS'],this.AWS);
            let bucket = "dazzle-template";
            return new Promise(function(resolve, reject) {
                let s3 = new AWS.S3();

                let params = {
                    Bucket: bucket,
                    Key: "user-data/" + window["uid"] + "/" + key
                };

                console.log("User Data", params);
                s3.removeObject(params, function(err, data) {
                    if (err) {
                        console.log(err);
                        reject("Remove User Data", err);
                    } else {
                        console.log(data);
                        resolve(data);
                    }
                });
            });
        }
        saveUserData(key, string) {
            let AWS = this.AWS;
            // console.log(window['AWS'],this.AWS);
            let bucket = "dazzle-template";
            return new Promise(function(resolve, reject) {
                let s3 = new AWS.S3();

                let params = {
                    Bucket: bucket,
                    Key: "user-data/" + window["uid"] + "/" + key,
                    Body: string,
                    ContentType: "text/html",
                };
                let ext;
                if (key.indexOf(".") > -1) ext = key.substr(key.lastIndexOf(".") + 1);
                else ext = "";
                if (ext === "css") {
                    params.ContentType = "text/css";
                } else if (ext === "less") {
                    params.ContentType = "text/css";
                } else if (ext === "js") {
                    params.ContentType = "application/javascript";
                } else if (ext === "json") {
                    params.ContentType = "application/json";
                } else if (ext === "jpg") {
                    params.ContentType = "image/jpeg";
                } else if (ext === "jpeg") {
                    params.ContentType = "image/jpeg";
                } else if (ext === "png") {
                    params.ContentType = "image/png";
                } else if (ext === "gif") {
                    params.ContentType = "image/gif";
                } else if (ext === "html") {
                    params.ContentType = "text/html";
                } else {
                    params.ContentType = "text/html";
                }
                console.log("User Data", params);
                s3.putObject(params, function(err, data) {
                    if (err) {
                        console.log(err);
                        reject("Save User Data", err);
                    } else {
                        console.log(data);
                        resolve(data);
                    }
                });
            });
        }
        saveUserData(path, string) {
            let AWS = this.AWS;
            let key = "user-data/" + Dazzle.uid + "/" + path;
            // console.log(window['AWS'],this.AWS);
            let bucket = this.bucket;
            return new Promise(function(resolve, reject) {
                let s3 = new AWS.S3();

                let params = {
                    Bucket: "dazzle-template",
                    Key: key,
                    Body: string,
                    ContentType: "text/html",
                };
                let ext;
                if (key.indexOf(".") > -1) ext = key.substr(key.lastIndexOf(".") + 1);
                else ext = "";
                if (ext === "css") {
                    params.ContentType = "text/css";
                } else if (ext === "less") {
                    params.ContentType = "text/css";
                } else if (ext === "js") {
                    params.ContentType = "application/javascript";
                } else if (ext === "json") {
                    params.ContentType = "application/json";
                } else if (ext === "jpg") {
                    params.ContentType = "image/jpeg";
                } else if (ext === "jpeg") {
                    params.ContentType = "image/jpeg";
                } else if (ext === "png") {
                    params.ContentType = "image/png";
                } else if (ext === "gif") {
                    params.ContentType = "image/gif";
                } else if (ext === "html") {
                    params.ContentType = "text/html";
                } else {
                    params.ContentType = "text/html";
                }
                console.log(params);
                s3.putObject(params, function(err, data) {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        console.log(data);
                        resolve(data);
                    }
                });
            });
        }
        saveHtml(key, string) {
            let AWS = this.AWS;
            // console.log(window['AWS'],this.AWS);
            let bucket = this.bucket;
            return new Promise(function(resolve, reject) {
                let s3 = new AWS.S3();

                let params = {
                    Bucket: bucket,
                    Key: key,
                    Body: string,
                    ContentType: "text/html",
                };

                console.log(params);
                s3.putObject(params, function(err, data) {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        console.log(data);
                        resolve(data);
                    }
                });
            });
        }
        saveFile(key, string) {
            let AWS = this.AWS;
            // console.log(window['AWS'],this.AWS);
            let bucket = this.bucket;
            return new Promise(function(resolve, reject) {
                let s3 = new AWS.S3();

                let params = {
                    Bucket: bucket,
                    Key: key,
                    Body: string,
                    ContentType: "text/html",
                };
                let ext;
                if (key.indexOf(".") > -1) ext = key.substr(key.lastIndexOf(".") + 1);
                else ext = "";
                if (ext === "css") {
                    params.ContentType = "text/css";
                } else if (ext === "less") {
                    params.ContentType = "text/css";
                } else if (ext === "js") {
                    params.ContentType = "application/javascript";
                } else if (ext === "json") {
                    params.ContentType = "application/json";
                } else if (ext === "jpg") {
                    params.ContentType = "image/jpeg";
                } else if (ext === "jpeg") {
                    params.ContentType = "image/jpeg";
                } else if (ext === "png") {
                    params.ContentType = "image/png";
                } else if (ext === "gif") {
                    params.ContentType = "image/gif";
                } else if (ext === "html") {
                    params.ContentType = "text/html";
                } else {
                    params.ContentType = "text/html";
                }
                console.log(params);
                s3.putObject(params, function(err, data) {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        console.log(data);
                        resolve(data);
                    }
                });
            });
        }
        getContent(url) {
            console.log("Query Url", url);
            return new Promise(function(resolve, reject) {
                fetch(url, {
                        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
                        mode: "no-cors",
                    })
                    .then((response) => resolve(response.text()))
                    .catch((error) => {
                        console.error("Error:", error);
                        reject();
                    });
            });
        }
        getFile(key) {
            let that = this;
            let AWS = this.AWS;
            let bucket = this.bucket;
            // let AWS = window['AWS'];

            // console.log(window,window['AWS']);
            return new Promise(function(resolve, reject) {
                let s3 = new AWS.S3();
                let params = {
                    Bucket: bucket,
                    Key: key,
                    ResponseExpires: new Date().getTime(),
                };
                console.log("Get File", params);
                s3.getObject(params, function(err, data) {
                    console.log("Data", params, data);
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data.Body.toString());
                    }
                });
            });
        }
    };
    let DataPackage = class {
        constructor(table) {
            this.dbUrl =
                "https://41khtanrje.execute-api.ap-northeast-1.amazonaws.com/prod/Dazzle-elasticSearchController";
            this.signUrl = "https://0mx3cqjlkh.execute-api.ap-northeast-1.amazonaws.com/default/getPresignedURL";

            this.uid = Dazzle.uid;
            this.table = table || "_info";
            // if (!table){
            //     let index = prompt("請輸入新資料表的名稱");
            //     this.createTable(index).then(result=>{
            //             console.log(result);
            //             window['myTable'].push(this);
            //             alert('成功建立資料表:'+index);
            //     },err=>{
            //         alert('資料表可能已建立，或者其他錯誤。請聯絡管理員');
            //     });

            // }
        }

        getGridColumns() {
            let that = this;
            return new Promise(function(resolve, reject) {
                that
                    .getContent(
                        "https://d25k6mzsu7mq5l.cloudfront.net/user-data/" +
                        window["tid"] +
                        "/DZ-DATASET/" +
                        that.table +
                        ".json?id=" +
                        new Date().getTime()
                    )
                    .then((result) => {
                        that.schema = JSON.parse(result);
                        resolve(that.constructColumns());
                    });
            });
        }
        constructColumns() {
            let fields = this.schema.field;
            let default_col = {
                sortable: true,
                filter: true,
            };
            this.columns = [];
            this.key = "_id";

            fields.forEach((item) => {
                console.log("Items", item);

                let label = item["label"] || item["field"];
                default_col = {
                    field: item["field"],
                    headerName: label,
                    sortable: true,
                    filter: true,
                };
                switch (item["type"]) {
                    case "key":
                        this.key = item["field"];
                        default_col["hide"] = true;
                        break;

                    case "date":
                        default_col["cellRenderer"] = window["DateRenderer"];
                        default_col["cellEditor"] = window["DateEditor"];
                        break;

                    case "file":
                        default_col["cellRenderer"] = window["FileRenderer"];
                        break;

                    case "select":
                        default_col["cellEditor"] = "agSelectCellEditor";
                        default_col["cellEditorParams"] = {
                            values: item["list"],
                        };
                        break;

                    case "page":
                        default_col["cellRenderer"] = window["PageRenderer"];
                        default_col["cellEditor"] = null;
                        default_col["pageTemplate"] = item["pageTemplate"];
                        default_col["pageName"] = item["pageName"];
                        break;

                    case "code":
                        default_col["cellRenderer"] = window["codeRenderer"];
                        default_col["cellEditor"] = null;
                        break;

                    case "image":
                        default_col["cellRenderer"] = window["ImageRenderer"];
                        break;
                }

                this.columns.push(default_col);
            });
            console.log("This Columns", this.columns);

            return this.columns;
        }
        postData(url, data) {
            // Default options are marked with *

            return new Promise(function(resolve, reject) {
                fetch(url, {
                    body: JSON.stringify(data), // must match 'Content-Type' header
                    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
                    credentials: "same-origin", // include, same-origin, *omit
                    headers: {
                        "content-type": "application/json",
                    },
                    method: "POST", // *GET, POST, PUT, DELETE, etc.
                    mode: "cors", // no-cors, cors, *same-origin
                    redirect: "follow", // manual, *follow, error
                    referrer: "no-referrer", // *client, no-referrer
                }).then((response) => {
                    resolve(response.json());
                }); // parses response to JSON
            });
        }

        saveSchema(schema) {
            let that = this;
            let json = {
                action: "addData",
                index: window["uid"],
                type: "_info",
                id: this.table,
                body: {
                    schema: schema,
                },
            };
            console.log(JSON.stringify(json));
            return new Promise(function(resolve, reject) {
                that.postData(that.dbUrl, json).then((result) => {
                    console.log(result);
                    if (result.code < 0) {
                        resolve({});
                    } else {
                        resolve(result.resolve);
                    }
                });
            });
        }

        createIndex(table) {
            let that = this;
            let json = {
                action: "createIndex",
                index: Dazzle.uid + "." + table,
            };
            console.log(JSON.stringify(json));
            return new Promise(function(resolve, reject) {
                that.postData(that.dbUrl, json).then((result) => {
                    console.log(result);
                    if (result.code < 0) {
                        resolve({});
                    } else {
                        resolve(result.resolve);
                    }
                });
            });
        }
        saveDataWithCache(id,data){
            let user = Dazzle.user || Dazzle.subUser || null;
            let key = this.table + '-' +id;
            let path = "json/"+this.table+"-"+id+'.json';
            let fileManager;


            // Save Cache JSON
            if (user){
                fileManager = new AwsPackage(user);
                data.timestamp = new Date().getTime();
                fileManager.saveUserData(path,JSON.stringify(data));
            }
            // save Cookie
            store.set(key,data);
            // save Database
            let that = this;
            return new Promise(function(resolve, reject) {
                delete data.timestamp; 
                that.saveData(id,data).then(res=>{
                    resolve();
                },err=>{
                    reject();
                });
            });

        }

        getDataByCache(id){
            console.log('ID is null 1',id);
            if (id == "null"){
                console.log('ID is null 2',id);
                return;
            }

            let key = this.table + '-' +id;
            let cache = store.get(key) || null;
            console.log('Cache',cache,id);
            let path = "json/"+this.table+"-"+id+'.json';
            let that = this;
            let json;
            let timestamp;
            const DIFF = 432000000; // 5 Days

            return new Promise(function(resolve, reject) {

                function loadData(id){
                    that.loadData(id).then(res => {
                        console.log('Load Data');
                        if (Object.keys(res).length === 0) {
                            reject();
                        } else {
                            console.log('Save Data');
                            // console.log('Cannot read product', res);
                            that.saveDataWithCache(id,res);
                            resolve(res);
                        }


                    });
                }

                if (cache) {
                    console.log('Cache 2');
                    resolve(cache);
                }

                else {
                    console.log('No Cache',id);
                        Dazzle.getUserDataContent(path).then(str=>{
                            console.log('JSON',id,str);

                                json = JSON.parse(str);
                                timestamp = json['timestamp'] || null;
                                let now = new Date().getTime();
                                let diff;
                                if (timestamp)
                                    diff= now - timestamp;
                                else 
                                    diff = 0;

                                console.log('Timestamp',timestamp,diff,now);

                                if (diff>DIFF) {
                                    loadData(id);
                                } else {
                                    delete json.timestamp;
                                    console.log('JSON',json);
                                    store.set(key,json);
                                    resolve(json);
                                }
                                // if (timestamp) {
                                //     delete json.timestamp; 
                                //     let diff = new Date().getTime() - timestamp;
                                //     if (diff>432000)
                                //         loadData(id); 
                                //     else {
                                //         store.set(key,json);
                                //         resolve(json);
                                //     }
                                // } else {
                                //     loadData(id);
                                // }




                            }, err => {
                                loadData(id);
                                // that.loadData(id).then(res => {
                                //     console.log('Data',id,res);
                                //     if (Object.keys(res).length === 0) {
                                //         reject();
                                //     } else {
                                //         // console.log('Cannot read product', res);
                                //         that.saveDataWithCache(id,res);
                                //         resolve(res);
                                //     }


                                // });
                            });
                    }
                });                        
                


        }

        searchDataByQuery(query) {
            let table = this.table;
            let that = this;
            let params = {
                action: "searchData",
                index: this.uid,
                type: table,
                body: {
                    query: query
                }
            };
            console.log("Params", params);
            return new Promise(function(resolve, reject) {
                that.postData(that.dbUrl, params).then((result) => {
                    if (result.code < 0) {
                        reject();
                    } else {
                        resolve(result.resolve);
                    }
                });
            });
        }

        matchData(json) {
            let table = this.table;
            let that = this;
            let params = {
                action: "searchData",
                index: this.uid,
                type: table,
                body: {
                    query: {
                        match: json,
                    },
                }
            };
            console.log("Params", params);
            return new Promise(function(resolve, reject) {
                that.postData(that.dbUrl, params).then((result) => {
                    if (result.code < 0) {
                        reject();
                    } else {
                        resolve(result.resolve);
                    }
                });
            });
        }

        saveData(id, data) {
            let table = this.table;
            let that = this;
            let json = {
                action: "addData",
                index: this.uid,
                type: table,
                id: id,
                body: data,
            };
            console.log(JSON.stringify(json));
            return new Promise(function(resolve, reject) {
                that.postData(that.dbUrl, json).then((result) => {
                    console.log(result);
                    if (result.code < 0) {
                        resolve({});
                    } else {
                        resolve(result.resolve);
                    }
                });
            });
        }
        getToken(token) {
            let that = this;
            let now = new Date().getTime();
            let json = {
                action: "getData",
                index: "dazzle",
                type: "token",
                id: token,
            };
            console.log(json);
            return new Promise(function(resolve, reject) {
                that.postData(that.dbUrl, json).then((result) => {
                    if (result.code < 0) {
                        resolve({});
                    } else {
                        console.log(result.resolve);
                        resolve(result.resolve);
                    }
                });
            });
        }
        saveToken(uid, token, user) {
            let table = this.table;
            let that = this;
            let now = new Date().getTime();
            let json = {
                action: "addData",
                index: "dazzle",
                type: "token",
                id: token,
                body: {
                    expiryDate: now + 6 * 3600 * 1000,
                    uid: uid,
                    id: token,
                    user: user,
                    createDate: now,
                },
            };
            console.log(json);
            return new Promise(function(resolve, reject) {
                that.postData(that.dbUrl, json).then((result) => {
                    console.log(result);
                    if (result.code < 0) {
                        reject();
                    } else {
                        resolve(result);
                    }
                });
            });
        }

        getAllTokenData() {
            let table = this.table;
            let that = this;
            let json = {
                action: "searchData",
                index: "dazzle",
                type: "token",
                body: {
                    query: {
                        match_all: {},
                    },
                },
            };
            console.log("Get all", json);
            return new Promise(function(resolve, reject) {
                that.postData(that.dbUrl, json).then((result) => {
                    if (result.code < 0) {
                        resolve([]);
                    } else {
                        resolve(result.resolve);
                    }
                });
            });
        }

        getAllData() {
            let table = this.table;
            let that = this;
            let json = {
                action: "searchData",
                index: this.uid,
                type: table,
                body: {
                    query: {
                        match_all: {},
                    },
                    sort: [{
                        _id: {
                            order: "desc"
                        },
                    }, ],
                },
            };
            console.log("Get all", json);
            return new Promise(function(resolve, reject) {
                that.postData(that.dbUrl, json).then((result) => {
                    if (result.code < 0) {
                        resolve([]);
                    } else {
                        resolve(result.resolve);
                    }
                });
            });
        }
        removeData(id) {

            store.remove(this.table+'-'+id);
            let fileManager = Dazzle.fileManager;
            fileManager.removeUserData('json/'+this.table+'-'+id+'.json');

            let table = this.table;
            let that = this;
            let json = {
                action: "deleteData",
                index: this.uid,
                type: table,
                id: id,
            };
            console.log(JSON.stringify(json));
            return new Promise(function(resolve, reject) {
                that.postData(that.dbUrl, json).then((result) => {
                    console.log(result);
                    if (result.code < 0) {
                        resolve({});
                    } else {
                        console.log(result.resolve);
                        resolve(result.resolve);
                    }
                });
            });
        }

        login(uid, password) {
            let loginUrl =
                "https://37nolo3390.execute-api.ap-northeast-1.amazonaws.com/prod";
            let params = {
                uid: uid,
                password: password,
                type: "loginByUidPassword",
            };
            return new Promise(function(resolve, reject) {
                that.postData(loginUrl, params).then((res) => {
                    console.log("Result", res);
                });
            });
        }
        loadWebsite(){
            let table = this.table;
            let that = this;
            let json = {
                action: "searchData",
                index: "dazzle",
                type: "website",
                body:{
                    "query":{
                        "match_all":{}
                    }
                }
            };
            console.log(json);
            return new Promise(function(resolve, reject) {
                that.postData(that.dbUrl, json).then((result) => {
                    if (result.code < 0) {
                        resolve([]);
                    } else {
                        console.log(result.resolve);
                        resolve(result.resolve);
                    }
                });
            });
        }
        loadData(id) {
            let table = this.table;
            let that = this;
            let json = {
                action: "getData",
                index: this.uid,
                type: table,
                id: id,
            };
            console.log(json);
            return new Promise(function(resolve, reject) {
                that.postData(that.dbUrl, json).then((result) => {
                    if (result.code < 0) {
                        resolve({});
                    } else {
                        console.log(result.resolve);
                        resolve(result.resolve);
                    }
                });
            });
        }
        updateData(id, data) {
            let that = this;
            let index = uid;
            let table = this.table;
            delete data["_id"];

            let params = {
                action: "addData",
                index: this.uid,
                type: table,
                id: id,
                body: data,
                // "sort":[{"發佈日期":"desc"}]
            };
            return new Promise(function(resolve, reject) {
                that
                    .postData(that.dbUrl, params)
                    .then((data) => {
                        console.log("Data", data);
                        if (data.code > 0) {
                            console.log("成功更新");
                            resolve();
                            // alert('成功更新資料');
                            // that.refresh();
                        }
                    }) // JSON from `response.json()` call
                    .catch((error) => {
                        console.error(error);
                        reject();
                    });
            });
        }
        bulkUpdateData(params) {
            console.log("Params", params);
            let that = this;
            let json = {
                action: "bulkData",
                body: params,
            };
            console.log(JSON.stringify(json));
            return new Promise(function(resolve, reject) {
                that
                    .postData(that.dbUrl, json)
                    .toPromise()
                    .then((result) => {
                        console.log(result);
                        if (result.code > 0) {
                            resolve();
                            z;
                        } else {
                            console.log("Error", result.text + ":" + result.err.code);
                            reject();
                        }
                    });
            });
        }
        removeGalleryRecord(id) {
            let that = this;
            let json = {
                action: "deleteData",
                index: "gallery",
                type: "table",
                id: id,
            };
            console.log(json);
            return new Promise(function(resolve, reject) {
                that.postData(that.dbUrl, json).then((result) => {
                    console.log("Result", result);
                    if (result.code < 0) {
                        resolve({});
                    } else {
                        console.log(result.resolve);
                        resolve(result.resolve);
                    }
                });
            });
        }
        getGalleryRecord(id) {
            let that = this;
            let json = {
                action: "getData",
                index: "gallery",
                type: "table",
                id: id,
            };
            console.log(json);
            return new Promise(function(resolve, reject) {
                that.postData(that.dbUrl, json).then((result) => {
                    if (result.code < 0) {
                        resolve({});
                    } else {
                        console.log(result.resolve);
                        resolve(result.resolve);
                    }
                });
            });
        }

        getContent(url) {
            console.log("Query Url", url);
            return new Promise(function(resolve, reject) {
                fetch(url)
                    .then((response) => resolve(response.text()))
                    .catch((error) => {
                        console.error("Error:", error);
                        reject();
                    });
            });
        }
        newSaveToken(token) {
            let loginUrl =
                "https://d8fz9pfue5.execute-api.ap-northeast-1.amazonaws.com/prod/newMiscDazzleFunction";
            let params = {
                "action": "loginByToken",
                "token": token
            };
            return new Promise(function(resolve, reject) {
                that.postData(loginUrl, params).then((res) => {
                    console.log("Token Login Result", res);
                });
            });
        }
    };
    
    let Dazzle ={};
    Dazzle.noElements = 0;
    Dazzle.elements = {};
    Dazzle.history = [];
    Dazzle.editing = false;
    Dazzle.editor = false;
    
   

   

    Dazzle.getUserDataContent = function(path) {
        let url =
            "https://d25k6mzsu7mq5l.cloudfront.net/user-data/" +
            Dazzle.uid +
            "/" +
            path + '?=' + new Date().getTime();

        console.log("Query Url", url);
        return new Promise(function(resolve, reject) {
            fetch(url)
                .then((response) => {
                    if (!response.ok) {
                        reject();
                    } else resolve(response.text());
                })
                .catch((error) => {
                    console.error("Error:", error);
                    // reject();
                    reject();
                });
        });
    };

   

    Dazzle.sendEmail = function(to, subject, content) {
        return new Promise(function(resolve, reject) {
            let url = "https://9hhtm40jpe.execute-api.ap-northeast-1.amazonaws.com/sendemail/";
            let parma = {
                "from": "support@01power.net",
                "to": to,
                "subject": subject,
                "html": content
            };
            console.log('Email Params',parma);
            Dazzle.postData(url, parma).then(res => {
                if (res.code > 0) {
                    console.log("666");
                    resolve();
                } else {
                    reject();
                    console.log("error la");
                }
            })
        });

    };
    
    Dazzle.parseTime = function(oldtime) {
        let _thetimenow = Date.now();
        let time = (_thetimenow - oldtime) / 1000;
        console.log('Parse Time',time);
        let sec = 60;
        let min = sec * 60;
        let hour = min * 24;
        let day = hour * 7;
        let week = hour * 30;
        let month = hour * 365;
        switch (true) {
            case (time < sec):
                return "剛剛";
                break;
            case (time < min):
                return Math.floor(time / sec) + "分鐘";
                break
            case (time < hour):
                return Math.floor(time / min) + "小時";
                break
            case (time < day):
                return Math.floor(time / hour) + "日";
                break
            case (time < week):
                return Math.floor(time / day) + "星期";
                break
            case (time < month):
                return Math.floor(time / week) + "月";
                break
            case (time > month):
                return Math.floor(time / month) + "年";
                break
        }

    }
    
    Dazzle.getContent = function(url) {
        console.log("Query Url", url);

        return new Promise(function(resolve, reject) {
            fetch(url)
                .then((response) => {
                    if (!response.ok) {
                        reject();
                    } else resolve(response.text());
                })
                .catch((error) => {
                    console.error("Error:", error);
                    reject();
                });
        });
    };

    Dazzle.loadScript = function(url) {
        const fileref = document.createElement("script");
        fileref.setAttribute("type", "text/javascript");
        fileref.setAttribute("src", url + "?id=" + new Date().getTime());
        document.head.appendChild(fileref);
    };

    Dazzle.loadStyle = function(url) {
        const ref = document.createElement("link");
        ref.setAttribute("href", url);
        ref.setAttribute("rel", "stylesheet");
        document.head.appendChild(ref);
    };


    Dazzle.loadComponent = function(cat, id) {


    let isReg =   customElements.get(id);

//        if (!com){

        if (!isReg){
            let local = Dazzle.dzLicense["local"] || false;
            let base;
            console.log('License',Dazzle.dzLicense,local);

            if (local) 
                base = "/";
            else 
                base = "https://d25k6mzsu7mq5l.cloudfront.net/";

            let html =
                '<script type="module" src=' +
                base +
                "node_modules/@dazzle/" +
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

    Dazzle.listenEvent = function() {
        if (this.editMode === "admin") {}
        if (this.editMode === "normal") {}
    };

    Dazzle.popup = function(dialog, folder, component, width, height) {

        customElements.whenDefined(component).then(function() {
            dialog.renderer = function(root, dialog) {
                root.innerHTML = '<' + component + '></' + component + '>';
            };
            dialog.resizable = true;
            dialog.resize(width, height);
            dialog.opened = true;
            // Dazzle.activeDialog = dialog;   
        });

    }
    Dazzle.closeDialog = function(dialog) {
        if (!dialog)
            dialog = Dazzle.dialog;
        dialog.opened = false;
    }

    Dazzle.componentPopup = function(component, width, height) {

        let dialog = component.dialog || null;

        if (!dialog)
            dialog = document.querySelector('dz-admin').shadowRoot.querySelector('vaadin-dialog');

        console.log('Component Dialog', dialog);
        // let dialog = document.querySelector('vaadin-dialog');
        dialog.renderer = function(root, dialog) {
            // root.innerHTML = '<' + component + '></' + component + '>';
            if (root.firstElementChild) {
                return;
            }
            root.appendChild(component);
        };

        dialog.resizable = true;
        dialog.resize(width, height);
        dialog.opened = true;
        // Dazzle.activeDialog = dialog;   

    }


    Dazzle.dzInit = function() {
        // this.loadComponent("dz-dazzle", "dz-wrapper");

        let editMode = store.get("editMode") || "normal";
        let elm;
        let thisPage =
            decodeURIComponent(location.pathname).substring(
                location.pathname.indexOf("/") + 1
            ) || "index.html";

        this.editMode = editMode;
        Dazzle.noElements = 0;
        Dazzle.elements = {};
        Dazzle.history = [];
        Dazzle.editing = false;
        Dazzle.editor = false;

        if (editMode === "admin") {
            let user = store.get("user") || null;
            console.log('User', user);
            user['userBucket'] = Dazzle.dzLicense['userBucket'];
            this.fileManager = new AwsPackage(user);
            this.dataManager = new DataPackage("_info");
            this.user = user;
            this.tid = Dazzle.dzLicense["tid"];
            this.uid = this.user["uid"];
            this.userBucket = Dazzle.dzLicense["userBucket"];
            this.websiteUrl = this.user["websiteUrl"] || "//" + this.userBucket + "/";
            this.userType = Dazzle.dzLicense["userType"] || "normal";

            //   this.thisPage = document.querySelector('meta[thispage]').getAttribute('thispage') || thisPage;
            this.thisPage = thisPage;
            // document.body.innerHTML = '<dz-wrapper></dz-wrapper><vaadin-dialog></vaadin-dialog>';

            // this.loadHtmlClass();
            this.loadComponent('dz-dazzle', 'dz-admin');
            // Dazzle.loadUserComponents();
            let elm = document.createElement('dz-wrapper');

            if (!document.querySelector('dz-wrapper')) {

                document.body.innerHTML = '';
                document.body.appendChild(elm);
                elm.adminPageLoader();



            } else {
                // elm.blankPageLoader();

                // let html = document.body.innerHTML;
                // if (!html){
                //     document.body.appendChild(elm);
                // }

            }
            // else {
            //     document.querySelector('dz-wrapper').pageLoader();                   
            // } 


        } else {
            this.uid =
                Dazzle.dzLicense["uid"] ||
                document.querySelector("meta[uid]").getAttribute("uid");
            this.tid =
                Dazzle.dzLicense["tid"] ||
                document.querySelector("meta[tid]").getAttribute("tid") ||
                this.uid;
            this.dataManager = new DataPackage("_info");
            this.userBucket = Dazzle.dzLicense["userBucket"] || null;
            this.websiteUrl = location.hostname;
            this.thisPage = thisPage;
            this.userType = Dazzle.dzLicense["userType"] || "normal";
            // document.body.innerHTML =
            //     "<dz-wrapper></dz-wrapper><dz-dazzle></dz-dazzle>";
            this.loadComponent("dz-dazzle", "dz-dazzle");

            let elm = document.createElement('dz-wrapper');


            let html = document.body.innerHTML;
            html = html.trim();
            if (!html) {
                document.body.appendChild(elm);
                // elm.blankPageLoader();
            }
        }

        if (Dazzle.editMode === 'normal') {
            console.log('Load Normal Dazzle');
            Dazzle.loadComponent("dz-dazzle", "dz-dazzle");
            let dzDazzle = document.createElement('dz-dazzle');
            document.body.appendChild(dzDazzle);
        } else {

            Dazzle.loadComponent("dz-dazzle", "dz-admin");

            let dzAdmin = document.createElement('dz-admin');
            document.body.appendChild(dzAdmin);
        }


        // elm = document.querySelector('dz-wrapper-head') || null;
        // if (!elm) {
        //     let head = document.createElement('dz-wrapper-head');
        //     document.head.appendChild(head);
        // }

        // this.loadComponent("dz-dazzle", "dz-wrapper");


    };

    Dazzle.loadUserComponents = function() {
        let components = Dazzle.dzLicense['component'] || null;
        let html, link;
        if (components) {
            components.forEach(item => {
                html = "/bower_components/" + item + '.html?id=' + new Date().getTime();
                link = document.createElement('link');
                link.setAttribute('rel', 'import');
                link.setAttribute('href', html);
                document.head.appendChild(link);
            });
        }
    }
    Dazzle.getMasterContent = function(type) {
        let that = this;
        let url =
            "https://d25k6mzsu7mq5l.cloudfront.net/user-data/" + Dazzle.uid + "/";
        let basePath = url + "template/" + this.tid + "/_master";
        let defaultPath = "template/" + this.tid + "/_default";
        // this.basePath = '//'+this.userBucket+'/template/'+this.tid+'/'+this.thisPage;
        this.masterPath = basePath;
        console.log("Path", basePath + "/" + type + "?id=" + new Date().getTime());

        return new Promise(function(resolve, reject) {
            // if (this.editMode==="normal")
            Dazzle.getContent(
                basePath + "/" + type + "?id=" + new Date().getTime()
            ).then(
                (result) => {
                    resolve(result);
                },
                (err) => {
                    resolve("");
                }
            );
        });
    };
    Dazzle.loadHead = function() {
        let that = this;
        let type = "head";
        let url =
            "https://d25k6mzsu7mq5l.cloudfront.net/user-data/" + Dazzle.uid + "/";
        let basePath =
            url +
            "template/" +
            this.tid +
            "/" +
            this.thisPage +
            "/" +
            type +
            "?id=" +
            new Date().getTime();

        let masterPath =
            url +
            "template/" +
            this.tid +
            "/_master" +
            "/" +
            type +
            "?id=" +
            new Date().getTime();

        let defaultPath =
            url +
            "template/" +
            this.tid +
            "/_default/" +
            type +
            "?id=" +
            new Date().getTime();

        // let defaultPath = 'template/'+this.tid+'/_default';
        // // this.basePath = '//'+this.userBucket+'/template/'+this.tid+'/'+this.thisPage;
        // this.basePath = basePath;
        // console.log('Path',basePath+'/'+type+'?id='+new Date().getTime());
        let head;
        let elm;
        let wrapper;
        let mFlag = false;
        let flag = false;
        return new Promise(function(resolve, reject) {

            Dazzle.getContent(masterPath).then(head => {
                elm = document.createRange().createContextualFragment(head);
                wrapper = document.createElement("dz-wrapper-master-head");
                wrapper.appendChild(elm);
                document.head.appendChild(wrapper);
                mFlag = true;
                if (mFlag && flag)
                    resolve();
            });

            Dazzle.getContent(basePath).then(head => {
                elm = document.createRange().createContextualFragment(head);
                wrapper = document.createElement("dz-wrapper-head");
                wrapper.appendChild(elm);
                document.head.appendChild(wrapper);
                flag = true;
                if (mFlag && flag)
                    resolve();
            }, err => {
                Dazzle.getContent(defaultPath).then(head => {
                    elm = document.createRange().createContextualFragment(head);
                    wrapper = document.createElement("dz-wrapper-head");
                    wrapper.appendChild(elm);
                    document.head.appendChild(wrapper);
                    flag = true;
                    if (mFlag && flag)
                        resolve();
                });
            });


            // Promise.all([
            //   Dazzle.getContent(masterPath),
            //   Dazzle.getContent(basePath),
            // ]).then(function (results) {
            //   let head;
            //   let elm;
            //   let wrapper;

            //   head = results[0];
            //   console.log('Head',results);
            //   elm = document.createRange().createContextualFragment(head);
            //   wrapper = document.createElement("dz-wrapper-master-head");
            //   wrapper.appendChild(elm);
            //   document.head.appendChild(wrapper);

            //   head = results[1];
            //   elm = document.createRange().createContextualFragment(head);
            //   wrapper = document.createElement("dz-wrapper-head");
            //   wrapper.appendChild(elm);
            //   document.head.appendChild(wrapper);
            //   resolve();
            // },err=>{
            //     console.log('Error',err);
            // });
        });
    };
    Dazzle.loadBodyJs = function() {
        let that = this;
        let type = "body_js";
        let url =
            "https://d25k6mzsu7mq5l.cloudfront.net/user-data/" + Dazzle.uid + "/";

        let basePath =
            url +
            "template/" +
            this.tid +
            "/" +
            this.thisPage +
            "/" +
            type +
            "?id=" +
            new Date().getTime();
        let masterPath =
            url +
            "template/" +
            this.tid +
            "/_master" +
            "/" +
            type +
            "?id=" +
            new Date().getTime();


        let defaultPath =
            url +
            "template/" +
            this.tid +
            "/_default/" +
            type +
            "?id=" +
            new Date().getTime();
        let head;
        let elm;
        let wrapper;
        let mFlag = false;
        let flag = false;

        return new Promise(function(resolve, reject) {

            Dazzle.getContent(masterPath).then(head => {
                elm = document.createRange().createContextualFragment(head);
                wrapper = document.createElement("dz-wrapper-master-body-js");
                wrapper.appendChild(elm);
                document.body.appendChild(wrapper);
                mFlag = true;
                if (mFlag && flag)
                    resolve();
            });

            Dazzle.getContent(basePath).then(head => {
                elm = document.createRange().createContextualFragment(head);
                wrapper = document.createElement("dz-wrapper-master-body-js");
                wrapper.appendChild(elm);
                document.body.appendChild(wrapper);
                flag = true;
                if (mFlag && flag)
                    resolve();
            }, err => {
                Dazzle.getContent(defaultPath).then(head => {
                    elm = document.createRange().createContextualFragment(head);
                    wrapper = document.createElement("dz-wrapper-body-js");
                    wrapper.appendChild(elm);
                    document.body.appendChild(wrapper);
                    flag = true;
                    if (mFlag && flag)
                        resolve();
                });
            });
        });
    };
    Dazzle.loadCss = function() {
        let that = this;
        let type = "css";
        let url =
            "https://d25k6mzsu7mq5l.cloudfront.net/user-data/" + Dazzle.uid + "/";
        let basePath =
            url +
            "template/" +
            this.tid +
            "/" +
            this.thisPage +
            "/" +
            type +
            "?id=" +
            new Date().getTime();
        let masterPath =
            url +
            "template/" +
            this.tid +
            "/_master" +
            "/" +
            type +
            "?id=" +
            new Date().getTime();

        let defaultPath =
            url +
            "template/" +
            this.tid +
            "/_default/" +
            type +
            "?id=" +
            new Date().getTime();
        let head;
        let elm;
        let wrapper;
        let mFlag = false;
        let flag = false;

        return new Promise(function(resolve, reject) {

            Dazzle.getContent(masterPath).then(head => {
                elm = document.createRange().createContextualFragment(head);
                wrapper = document.createElement("dz-wrapper-master-css");
                wrapper.appendChild(elm);
                document.head.appendChild(wrapper);
                mFlag = true;
                if (mFlag && flag)
                    resolve();
            });

            Dazzle.getContent(basePath).then(head => {
                elm = document.createRange().createContextualFragment(head);
                wrapper = document.createElement("dz-wrapper-master-css");
                wrapper.appendChild(elm);
                document.head.appendChild(wrapper);
                flag = true;
                if (mFlag && flag)
                    resolve();
            }, err => {
                Dazzle.getContent(defaultPath).then(head => {
                    elm = document.createRange().createContextualFragment(head);
                    wrapper = document.createElement("dz-wrapper-css");
                    wrapper.appendChild(elm);
                    document.head.appendChild(wrapper);
                    flag = true;
                    if (mFlag && flag)
                        resolve();
                });
            });
        });
    };

    Dazzle.loadHtml = function(shadow) {
        let that = this;
        let type = "html";
        let url =
            "https://d25k6mzsu7mq5l.cloudfront.net/user-data/" + Dazzle.uid + "/";
        let basePath =
            url +
            "template/" +
            this.tid +
            "/" +
            this.thisPage +
            "/" +
            type +
            "?id=" +
            new Date().getTime();
        let masterPath =
            url +
            "template/" +
            this.tid +
            "/_master" +
            "/" +
            type +
            "?id=" +
            new Date().getTime();
        let defaultPath =
            url +
            "template/" +
            this.tid +
            "/_default/" +
            type +
            "?id=" +
            new Date().getTime();
        // let masterPath = url+'template/'+this.tid+'/_master'+'/'+type;

        console.log("Load HTML", basePath);

        return new Promise(function(resolve, reject) {
            Dazzle.getContent(basePath).then(
                (html) => {
                    shadow.innerHTML = html;
                    resolve();
                },
                (err) => {
                    Dazzle.getContent(defaultPath).then(
                        (html) => {
                            shadow.innerHTML = html;
                            resolve();
                        },
                        (err) => {
                            resolve();
                        }
                    );
                }
            );
        });
    };

    Dazzle.loadBodyClass = function() {
        let type = "body_class";
        let url =
            "https://d25k6mzsu7mq5l.cloudfront.net/user-data/" + Dazzle.uid + "/";
        let basePath =
            url +
            "template/" +
            this.tid +
            "/" +
            this.thisPage +
            "/" +
            type +
            "?id=" +
            new Date().getTime();

        let masterPath =
            url +
            "template/" +
            this.tid +
            "/_master" +
            "/" +
            type +
            "?id=" +
            new Date().getTime();

        let defaultPath =
            url +
            "template/" +
            this.tid +
            "/_default/" +
            type +
            "?id=" +
            new Date().getTime();

        return new Promise(function(resolve, reject) {
            Dazzle.getContent(basePath).then(
                (bodyClass) => {
                    document.body.setAttribute("class", bodyClass);
                    resolve();
                },
                (err) => {
                    Dazzle.getContent(defaultPath).then(
                        (bodyClass) => {
                            document.body.setAttribute("class", bodyClass);
                            resolve();
                        });
                }
            );
        });
    };

    Dazzle.contextRender = function(menu) {
        console.log("Menu", menu, Dazzle._curElm);

        const shadow = document.querySelector("dz-wrapper");
        const contextMenu = document.querySelector("vaadin-context-menu");
        contextMenu.renderer = function(root) {
            let listBox = root.firstElementChild;
            // Check if there is a list-box generated with the previous renderer call to update its content instead of recreation
            if (listBox) {
                listBox.innerHTML = "";
            } else {
                listBox = window.document.createElement("vaadin-list-box");
                root.appendChild(listBox);
            }
            console.log("Root", root);
            menu.forEach(function(ele) {
                const item = window.document.createElement("vaadin-item");
                item.textContent = ele.label;
                console.log("Event", item);

                item.addEventListener("click", (e) => {
                    console.log("Event", Dazzle._curElm);

                    document.dispatchEvent(
                        new CustomEvent(ele.event, {
                            detail: {
                                size: "big",
                                element: that.curElm
                            },
                        })
                    );
                });
                listBox.appendChild(item);
            });
        };
    };

    Dazzle.getPageContent = function(type) {
        let that = this;
        let url =
            "https://d25k6mzsu7mq5l.cloudfront.net/user-data/" + Dazzle.uid + "/";
        let basePath = url + "template/" + this.tid + "/" + this.thisPage;
        let masterPath = url + "template/" + this.tid + "/_master";

        let defaultPath = "template/" + this.tid + "/_default";
        // this.basePath = '//'+this.userBucket+'/template/'+this.tid+'/'+this.thisPage;
        this.basePath = basePath;
        console.log("Path", basePath + "/" + type + "?id=" + new Date().getTime());

        return new Promise(function(resolve, reject) {
            // if (this.editMode==="normal")

            Dazzle.getContent(
                basePath + "/" + type + "?id=" + new Date().getTime()
            ).then(
                (result) => {
                    resolve(result);
                },
                (err) => {
                    Dazzle.getContent(
                        defaultPath + "/" + type + "?id=" + new Date().getTime()
                    ).then(
                        (result) => {
                            resolve(result);
                        },
                        (err) => {
                            reject();
                        }
                    );
                }
            );
        });
    };

    Dazzle.componentLoader = function() {
        let basePath = "template/" + this.tid + "/";
        this.getContent(basePath + "_master/components").then((html) => {
            let elm = document.createRange().createContextualFragment(html);
            let dzCom = document.createElement("dz-wrapper-component");
            dzCom.appendChild(elm);
            document.head.appendChild(dzCom);
        });
    };


    Dazzle.pageLoader = function(shadow) {
        let that = this;
        Dazzle.shadow = shadow;
        let basePath = "template/" + this.tid + "/" + this.thisPage;
        this.basePath = basePath;

        let style = shadow.querySelector("style");
        console.log("Style", style, shadow);

        Promise.all([
            Dazzle.loadHead(),
            Dazzle.loadCss(),
            Dazzle.loadHtml(shadow),
            Dazzle.loadBodyJs(),
            Dazzle.loadBodyClass(),
        ]).then(res => {
            console.log('End Load Html', Dazzle.editMode);
            if (Dazzle.editMode === 'admin') {
                console.log('Init Menu');
                Dazzle.initMenu(document.querySelector('dz-wrapper'));
            }
        }, err => {
            if (Dazzle.editMode === 'admin') {
                console.log('Init Menu');
                Dazzle.initMenu(document.querySelector('dz-wrapper'));
            }
        });
    };

    Dazzle.dzElementFire = function(elm, event, params) {
        console.log("Fire", event, params);
        elm.dispatchEvent(new CustomEvent(event, params));
    };

    Dazzle.dzFire = function(event, params) {
        console.log("Fire", event, params);
        document.dispatchEvent(new CustomEvent(event, params));
    };

    Dazzle.import = function(url) {
            let a = new URL(url);
            // let pathname = a.pathname;
            // console.log('Path Name',pathname);
            let pathname = this.thisPage;
            let that = this;
            let basePath = "template/" + this.tid + "/" + this.thisPage;
            let defaultPath = "template/" + this.tid + "/_default";
            let masterPath = "template/" + this.tid + "/_master";
            let exportElm;
            let script = document.createElement("script");
            let link = document.createElement("link");
            script.setAttribute(
                "src",
                "https://d25k6mzsu7mq5l.cloudfront.net/bower_components/webcomponentsjs/webcomponents-lite.js"
            );
            script.setAttribute('dz-head', '');
            link.setAttribute("rel", "import");
            link.setAttribute(
                "href",
                "/bower_components/dz-dazzle/dz-loader.html"
            );
            link.setAttribute('dz-head', '');

            this.fileManager.getExternalContent(url).then((html) => {
                var elm = document.createElement("html");

                let css = "";
                elm.innerHTML = html;
                let head, body;
                let bodyClass = elm.querySelector("body").getAttribute("class");
                let bodyJs = "";
                head = elm.querySelector('head').innerHTML || '';

                elm.querySelectorAll('a').forEach(item => {
                    let src = item.getAttribute('href');
                    if (!isAbsoluteUrl(src))
                        item.setAttribute('href', absUrl(url, src));

                });

                // Absolute Path
                elm.querySelectorAll('img').forEach(item => {

                    let src = item.getAttribute("src") || null;
                    // console.log("HREF", url);

                    if (!isAbsoluteUrl(src))
                        item.setAttribute('src', absUrl(url, src));

                });

                elm.querySelectorAll('link[rel="stylesheet"]').forEach((item) => {
                    // css += item.outerHTML+"\n";
                    let href = item.getAttribute("href") || null;
                    // console.log("HREF", url);

                    if (!isAbsoluteUrl(href))
                        item.setAttribute('href', absUrl(url, href));

                    css += item.outerHTML + "\n";
                    // item.remove();
                });
                elm.querySelectorAll("style").forEach((item) => {
                    css += item.outerHTML + "\n";
                    // item.remove();
                });


                elm.querySelectorAll("body script").forEach((item) => {
                    // let url = item.getAttribute("src") || null;

                    let src = item.getAttribute("src") || null;
                    // console.log("HREF", url);

                    if (!isAbsoluteUrl(src))
                        item.setAttribute('src', absUrl(url, src));


                    bodyJs += item.outerHTML + "\n";
                    // item.remove();
                });

                exportElm = elm.cloneNode(true);
                exportElm.querySelector('head').appendChild(script);
                exportElm.querySelector('head').appendChild(link);

                this.fileManager.saveHtml(Dazzle.thisPage, exportElm.outerHTML);

                // Remove Link from head and Script from body.
                elm.querySelectorAll('link[rel="stylesheet"]').forEach((item) => {
                    item.remove();
                });

                elm.querySelectorAll("style").forEach((item) => {
                    item.remove();
                });

                elm.querySelectorAll("body script").forEach((item) => {
                    item.remove();
                });

                head = elm.querySelector("head").innerHTML;
                body = elm.querySelector("body").innerHTML;

                console.log('Export', head, css, body, bodyJs, bodyClass);
                this.fileManager.saveUserData(basePath + '/head', head + css);
                this.fileManager.saveUserData(basePath + '/css', css);
                this.fileManager.saveUserData(basePath + '/html', body);
                this.fileManager.saveUserData(basePath + '/body_js', bodyJs);
                this.fileManager.saveUserData(basePath + '/body_class', bodyClass);

            });

            function absUrl(url, href) {
                console.log('Url', url);
                let urlStr = new URL(url) || null;
                let arr = urlStr.pathname.split("/");
                arr.splice(arr.length - 1, 1);
                let newPath = arr.join("/");
                let newUrl;
                if (url[0] != '/')
                    newUrl = urlStr.origin + newPath + '/' + href;
                else
                    newUrl = urlStr.origin + href;

                console.log('Url Str', newUrl);
                return newUrl;
                // item.setAttribute('href',newUrl);
            }

            function isAbsoluteUrl(url) {
                switch (url[0]) {
                    case 'h':
                        if (url.indexOf("http:") > -1)
                            return true;
                        else
                            return false;
                        break;

                    case '/':
                        if (url.indexOf("//") > -1)
                            return true;
                        else
                            return false;
                        break;

                    case '#':
                        return true;
                        break;

                    default:
                        return false;
                        break;

                }

            }
        }
        //    console.log('License',  await Dazzle.getContent('dz-license') );

    Dazzle.postData = function(url, data) {
        // Default options are marked with *

        return new Promise(function(resolve, reject) {
            fetch(url, {
                body: JSON.stringify(data), // must match 'Content-Type' header
                cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
                credentials: "same-origin", // include, same-origin, *omit
                headers: {
                    "content-type": "application/json",
                },
                method: "POST", // *GET, POST, PUT, DELETE, etc.
                mode: "cors", // no-cors, cors, *same-origin
                redirect: "follow", // manual, *follow, error
                referrer: "no-referrer", // *client, no-referrer
            }).then((response) => {
                resolve(response.json());
            }); // parses response to JSON
        });
    };

    Dazzle.exportByFile = function(thisPage) {
        let basePath = "template/" + Dazzle.tid + "/" + thisPage;
        let masterPath = "template/" + Dazzle.tid + "/_master";
        let content;
        let dzWrapperHead = document.querySelector('dz-wrapper-head') || null;
        let dzWrapperMasterHead = document.querySelector('dz-wrapper-master-head') || null;
        let dzWrapperCss = document.querySelector('dz-wrapper-css') || null;
        let dzWrapperMasterCss = document.querySelector('dz-wrapper-master-css') || null;
        let dzWrapperBodyJs = document.querySelector('dz-wrapper-body-js') || null;
        let dzWrapperMasterBodyJs = document.querySelector('dz-wrapper-master-body-js') || null;
        let dzWrapper = document.querySelector("dz-wrapper") || null;

        let dom = document.createElement("html");
        let head = document.createElement("head");
        let body = document.createElement("body");
        let script = document.createElement("script");
        let link = document.createElement("link");
        script.setAttribute(
            "src",
            "https://d25k6mzsu7mq5l.cloudfront.net/bower_components/webcomponentsjs/webcomponents-lite.js"
        );
        script.setAttribute('dz-head', '');
        link.setAttribute("rel", "import");
        link.setAttribute(
            "href",
            "/bower_components/dz-dazzle/dz-loader.html"
        );
        link.setAttribute('dz-head', '');
        head.appendChild(script);
        head.appendChild(link);

        let bHead, mHead, bCss, mCss, bBodyJs, mBodyJs, html;
        Promise.all([
            Dazzle.fileManager.getUserData(basePath + '/head'),
            Dazzle.fileManager.getUserData(basePath + '/html'),
            Dazzle.fileManager.getUserData(basePath + '/body_js')
        ]).then(res => {


            dzWrapperHead = document.createElement('dz-wrapper-head');
            dzWrapper = document.createElement('dz-wrapper');
            dzWrapperJs = document.createElement('dz-wrapper-js');
            let dzDazzle = document.createElement('dz-dazzle');
            dzWrapperHead.innerHTML = res[0] || '';
            dzWrapperJs.innerHTML = res[2] || '';
            dzWrapper.innerHTML = res[1] || '';
            head.appendChild(dzWrapperHead);
            body.appendChild(dzWrapper);
            body.appendChild(dzWrapperJs);
            body.appendChild(dzDazzle);

            dom.appendChild(head);
            dom.appendChild(body);

            let bodyClass = document.body.getAttribute("class") || "";
            body.setAttribute("class", bodyClass);
            // let headStr = head.innerHTML;
            // let noCache = `
            // <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
            // <meta http-equiv="Pragma" content="no-cache" />
            // <meta http-equiv="Expires" content="0" />
            // `;
            // headStr = noCache + headStr;
            // head.innerHTML = headStr;
            content = dom.outerHTML;
            console.log("Export", content);
            // Dazzle.fileManager.saveUserData("index.html", content);
            Dazzle.fileManager.saveHtml(Dazzle.thisPage, content);
        });
    }


    Dazzle.getExternalContent = function(url) {
        let miscFcUrl =
            "https://41khtanrje.execute-api.ap-northeast-1.amazonaws.com/prod/dazzleEditorMiscFunction";
        let params = {
            url: url,
            action: "grabPage",
        };
        let that = this;
        return new Promise(function(resolve, reject) {
            that.postData(miscFcUrl, params).then((result) => {
                resolve(result.resolve);
            });
        });
    };

    Dazzle.export = function() {
        // let url = 'https://d25k6mzsu7mq5l.cloudfront.net/user-data/'+Dazzle.uid+'/';
        console.log("Export")
        let bHead, mHead, bCss, mCss, bBodyJs, mBodyJs, html, elm, bodyClass, htmlClass;
        let basePath = "template/" + Dazzle.tid + "/" + Dazzle.thisPage;
        let masterPath = "template/" + Dazzle.tid + "/_master";

        // <script src="/node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js" async></script>
        // <script src="/js/dz-loader.js" type="module" async></script>
        
        
        let content, dzid;
        let dom = document.createElement("html");
        let head = document.createElement("head");
        let body = document.createElement("body");
        let script = document.createElement("script");
        let script2 = document.createElement('script');
        script.setAttribute(
            "src",
            "/node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js"
        );
        script.setAttribute('async','');
        script.setAttribute('dz-head', '');
        head.appendChild(script);
        
        script2.setAttribute(
            "src",
            "/js/dz-loader.js"
        );
        script2.setAttribute('async','');
        script2.setAttribute('type', 'module');
        script2.setAttribute('dz-head', '');
        head.appendChild(script2);
            
        head.insertAdjacentHTML('beforeend', this.pageHead);
        if (this.pageHtmlClass)
            dom.setAttribute('class',this.pageHtmlClass);
        if (this.pageBodyClass)
            body.setAttribute('class',this.pageBodyClass);


        let dzWrapper = Dazzle.shadowDOM.cloneNode(true);
        dzWrapper.querySelectorAll('[dzid]').forEach(item => {
            item.removeAttribute('dzid');
        });

        // body.appendChild(dzWrapper);
        body.innerHTML = dzWrapper.innerHTML;
        body.insertAdjacentHTML('beforeend', this.pageBodyJs);
        dom.appendChild(head);
        dom.appendChild(body);
        content = dom.outerHTML;
        
        content = "<!DOCTYPE html>"+content;
        Dazzle.fileManager.saveHtml(Dazzle.thisPage, content);
        alert("匯出成功");
    
    }

    Dazzle.sms = function(mobileNumber, data) {
        // Default options are marked with *

        return new Promise(function(resolve, reject) {
            let url = "https://e57jikxilj.execute-api.ap-northeast-1.amazonaws.com/prod/";
            let parma = {
                "to": mobileNumber,
                "message": data
            };
            Dazzle.postData(url, parma).then(res => {
                if (res.code > 0) {
                    console.log("666");
                    resolve("chenggongle");
                } else {
                    console.log("error la");
                }
            })
        });
    };


    Dazzle.loadPage = function(){
        Dazzle.loadComponent('dz-dazzle','dz-admin');
        console.log('Dz Dazzle Admin');
        // Dazzle.loadComponent('dz-dazzle','default-package/default-package');
        let basePath = "template/" + Dazzle.tid + "/" + Dazzle.thisPage ;
        
        Dazzle.getContent(Dazzle.thisPage).then(html=>{
        

            let parser = new DOMParser();
            let elm = parser.parseFromString(html, "text/html");
            console.log('Elm',elm);

            let body = elm.querySelector('body');
            let head = elm.querySelector('head');
            head.querySelectorAll('[dz-head]').forEach(item=>{item.remove();});
            let bodyJs ='';
            this.pageHead = head.innerHTML;
            // this.pageHtmlClass = elm.querySelector('html').getAttribute('class') || '';
            // document.querySelector('html').setAttribute('class',this.pageHtmlClass);
        
            this.pageHtmlClass = elm.querySelector('html').getAttribute('class') || '';
            this.pageBodyClass = body.getAttribute('class') || '';

            body.querySelectorAll('style').forEach(item=>{
                bodyJs += item.outerHTML;
                item.remove();
            });

            body.querySelectorAll('script').forEach(item=>{
                bodyJs += item.outerHTML;
                item.remove();
            });

            this.shadowHtml = body.innerHTML;

            
        


            // document.addEventListener('save',e=>{
            //     this.save();
            // });

            this.pageBodyJs =  bodyJs;

            let dzWrapper = document.createElement('dz-wrapper');
            dzWrapper.innerHTML = body.innerHTML;
            // import('./default-package/default-package.js').then((defaultPackage) => {
            //     dzWrapper.querySelectorAll('*').forEach(item=>{
            //                 new defaultPackage(item);
            //     });
            // });

            
            console.log('History',Dazzle.shadowDOM,this);

            document.body.innerHTML='';
            document.body.appendChild(dzWrapper);
//            document.body.innerHTML = body.innerHTML;

            let dzAdmin = document.createElement('dz-admin');
            document.body.appendChild(dzAdmin);

                        



        });

    };

    Dazzle.loadPageBodyJs=function(){

        let bodyJs;
        let body = document.body;
        
        body.querySelectorAll('style').forEach(item=>{
            bodyJs += item.outerHTML;
            item.remove();
        });

        body.querySelectorAll('script').forEach(item=>{
            bodyJs += item.outerHTML;
            item.remove();
        });


        let elm;
        if (!this.pageBodyJs)
            this.pageBodyJs = bodyJs;
        else
            bodyJs = this.pageBodyJs;
        // let bodyJs = this.pageBodyJs;
        window.setTimeout(function(){
            elm = document.createRange().createContextualFragment(bodyJs);
            document.body.appendChild(elm);
            Dazzle.dzElementFire(window,'load',{});
            Dazzle.dzElementFire(document,'ready',{});

        },1000);
    }

    Dazzle.menuLabel = {
        'IMG': '圖片',
        'A': '連結',
        'P': '段落文字',
        'H1': '標題1',
        'H2': '標題2',
        'H3': '標題3',
        'H4': '標題4',
        'H5': '標題5',
        'H6': '標題6',
        'DIV': '區塊',
        'NAV': '瀏覽區塊',
        'UL': '列表',
        'OL': '有序列表',
        'LI': '列表元素',
        'FORM': '表格',
        'INPUT': '輸入元素',
        'BUTTON': '按扭', 
    
     };
    
    Dazzle.changeList = [];
    
    
    Dazzle.initElement=function(){
        wrapper.querySelectorAll('*').forEach(item=>{
        new defaultPackage(item);
        });
    
    }
    Dazzle.getShadowItem = function(dzid){
        return Dazzle.shadowDOM.querySelector('[dzid="'+dzid+'"]') || null;
    }
    Dazzle.setShadowItem = function(dzid,item){
        Dazzle.shadowDOM.querySelector('[dzid="'+dzid+'"]') = item;
    }
    
    Dazzle.initSubElments = function(elm){
        elm.querySelectorAll('*').forEach(item=>{
             new defaultPackage(item);
        });
    }
   
    export  {Dazzle};
    window.AwsPackage = AwsPackage;
    window.DataPackage = DataPackage;
