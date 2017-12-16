import * as async from "async";
import * as crypto from "crypto";
import * as nodemailer from "nodemailer";
import * as passport from "passport";
import { Request, Response, NextFunction } from "express";
import { LocalStrategyInfo } from "passport-local";
import { WriteError } from "mongodb";
const request = require("express-validator");
const httpRequest = require("request");

import * as wechatHelper from "../helper/wechat";


/**
 * GET /getwxacodeunlimit
 * Login page.
 * https://mp.weixin.qq.com/debug/wxadoc/dev/api/qrcode.html
 */
export let getwxacodeunlimit = async (req: Request, res: Response) => {
    const result = await wechatHelper.getwxacodeunlimit(req.body);
    console.log(result);
    res.json({code: 0, data: result});
};

export let postSendTemplateMsg = async (req: Request, res: Response) => {
    const result = await wechatHelper.postSendTemplateMsg(req.body);
    console.log(result);
    res.json({code: 0, data: result});
};


