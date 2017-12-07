"use strict";

import * as async from "async";
import * as request from "request";
import { Response, Request, NextFunction } from "express";
const httpRequest = require("request");
import * as fs from "fs";

import * as path from "path";
const uuidv4 = require("uuid/v4");

/**
 * GET /api
 * List of API examples.
 */
export let getAccessToken = (appid: String) => {
    const url = process.env.WECHAT_ACCESS_TOKEN_SERVER + appid ;

    return new Promise(function(resolve, reject) {
        httpRequest(url, function (error: any, res: Response, body: any) {
            if (!error && res.statusCode == 200) {
                console.log("getAccessToken:", body);
                resolve(body);
            } else {
                console.log("getAccessToken error:", error);
                reject(error);
            }
        });
    });
};

/**
 * https://mp.weixin.qq.com/debug/wxadoc/dev/api/qrcode.html
 * @param body
 * {"path": "pages/index?query=1", "width": 430, auto_color: false, line_color: {"r":"0","g":"0","b":"0"}}
 */
export let getwxacode = async (body: any) => {
    return await getwxcode("https://api.weixin.qq.com/wxa/getwxacode?access_token=", body)
    .catch( (err) => {
        return "";
    });
};

/**
 * https://mp.weixin.qq.com/debug/wxadoc/dev/api/qrcode.html
 * @param body
 * {"scene": "XXX","page":"pages/index/index", "width": 430, auto_color: false, line_color: {"r":"0","g":"0","b":"0"}}
 */
export let getwxacodeunlimit = async (body: any) => {
    return await getwxcode("https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=", body)
    .catch( (err) => {
        return "";
    });
};

/**
 * https://mp.weixin.qq.com/debug/wxadoc/dev/api/qrcode.html
 * @param body
 * {"path": "pages/index?query=1", "width": 430}
 */
export let createwxaqrcode = async (body: any) => {
    return await getwxcode("https://api.weixin.qq.com/cgi-bin/wxaapp/createwxaqrcode?access_token=", body)
    .catch( (err) => {
        return "";
    });
};

  const getwxcode = async (baseUrl: String, reqbody: any) => {
    const accessToken = await getAccessToken(process.env.XIAOCHENXU_APPID);
    // https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=ACCESS_TOKEN
    const url = baseUrl + "" + accessToken;
    console.log(url);
    return new Promise(function(resolve, reject) {
        // res是二进制流，后台获取后，直接保存为图片，然后将图片返回给前台
        console.log("getwxacodeunlimit", "GET 二进制流 OK");
        const filePath = path.join(__dirname, "../public/uploads/barcode/");
        if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);
        const filename = uuidv4() + ".jpg";
        const fullfilename = path.join(filePath , filename ) ;

        // httpRequest.post({ url: url, json: true, body: reqbody }, function (error: any, res: Response, body: any) {
        //     if (!error && res.statusCode == 200) {
        //         fs.writeFile(fullfilename, body, "binary", function (err: any) {
        //             if (err) {
        //                 console.log("写入文件 fail");
        //                 reject(err);
        //             }
        //             console.log("down success");
        //             resolve("/uploads/barcode/" + filename);
        //         });
        //     } else {
        //         console.log("getwxacodeunlimit error:", error);
        //         reject(error);
        //     }
        // });
        httpRequest.post({ url: url, json: true, body: reqbody })
        .pipe(fs.createWriteStream(fullfilename));
        resolve("/uploads/barcode/" + filename);
    });
  };
