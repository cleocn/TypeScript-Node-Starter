"use strict";

import * as async from "async";
import * as httpRequest from "request";
import { Response, Request, NextFunction } from "express";
import * as fs from "fs";
import * as path from "path";
const uuidv4 = require("uuid/v4");

/**
 * GET /api
 * List of API examples.
 */
export let getAccessToken = (appid: String) => {
    const url = process.env.WECHAT_ACCESS_TOKEN_SERVER + appid ;
    console.log("WECHAT_ACCESS_TOKEN_SERVER:", url);

    return new Promise(function(resolve, reject) {
        httpRequest(url, function (error: any, res: any, body: any) {
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

export class SendTemplateData  {
    touser: string;
    template_id: string = "" ;
    page: string;
    form_id: string = "";
    data: any;
    color: string = "";
    emphasis_keyword: string = "";
}

export class SendTemplateData1 extends SendTemplateData  {
    template_id: string = "W3KfkaJY9Uxd-KmOfmZb7Z4FUkff4Vzb0BJMmbD4q_A";
    data: template1;
}
export type template1 = {
    keyword1: string , // 申请人   {{keyword1.DATA}}
    keyword2: string, // 关注对象    {{keyword2.DATA}}
    keyword3: string, // 申请时间  {{keyword3.DATA}}
    keyword4: string // 亲友关系    {{keyword4.DATA}}
};
// export let SendTemplateMsg1 = async ( data: SendTemplateData1) => {
//     postSendTemplateMsg(data);
// };

export let postSendTemplateMsg = async ( data: SendTemplateData) => {
    const accessToken = await getAccessToken(process.env.XIAOCHENXU_APPID);
    const url = "https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=" + accessToken ;

    return new Promise(function(resolve, reject) {
        httpRequest.post(url, {body: data}, function (error: any, res: any, body: any) {
            if (!error && res.statusCode == 200) {
                console.log("postSendTemplateMsg:", body);
                resolve(body);
            } else {
                console.log("postSendTemplateMsg error:", error);
                reject(error);
            }
        });
    });
};

/**
 * 接口A: 适用于需要的码数量较少的业务场景
 * https://mp.weixin.qq.com/debug/wxadoc/dev/api/qrcode.html
 * @param body
 * {"path": "pages/index?query=1", "width": 430, auto_color: false, line_color: {"r":"0","g":"0","b":"0"}}
 */
export let getwxacode = async (body: any) => {
    return await getwxcode("https://api.weixin.qq.com/wxa/getwxacode?access_token=", body);
};

/**
 * 接口B：适用于需要的码数量极多，或仅临时使用的业务场景
 * https://mp.weixin.qq.com/debug/wxadoc/dev/api/qrcode.html
 * @param body
 * {"scene": "XXX","page":"pages/index/index", "width": 430, auto_color: false, line_color: {"r":"0","g":"0","b":"0"}}
 */
export let getwxacodeunlimit = async (body: any) => {
    return await getwxcode("https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=", body);
};

/**
 * 接口C：适用于需要的码数量较少的业务场景
 * https://mp.weixin.qq.com/debug/wxadoc/dev/api/qrcode.html
 * @param body
 * {"path": "pages/index?query=1", "width": 430}
 */
export let createwxaqrcode = async (body: any) => {
    return await getwxcode("https://api.weixin.qq.com/cgi-bin/wxaapp/createwxaqrcode?access_token=", body);
};

  const getwxcode = async (baseUrl: String, reqbody: any) => {
    const accessToken = await getAccessToken(process.env.XIAOCHENXU_APPID);
    const url = baseUrl + "" + accessToken;
    console.log("getwxcode url:", url);
    return new Promise(function(resolve, reject) {
        const filePath = path.join(__dirname, "../public/uploads/barcode/");
        if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);
        const filename = uuidv4() + ".jpg";
        const fullfilename = path.join(filePath , filename ) ;

        const stream = httpRequest.post({ url: url, json: true, body: reqbody }) // 返回是二进制流，后台获取后，直接保存为图片，然后将图片返回给前台
        .pipe(fs.createWriteStream(fullfilename));

        stream.on("finish", function () {
            resolve("/uploads/barcode/" + filename);
        });
    });
  };
