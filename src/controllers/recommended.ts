
import * as async from "async";
import * as path from "path";
import { Request, Response, NextFunction } from "express";
import { WriteError } from "mongodb";

const request = require("express-validator");
const fs = require("fs");

import { default as Recommended, RecommendedModel } from "../models/Recommended";

import * as wechatHelper from "../helper/wechat";
import { Error } from "mongoose";
/**
 * GET /myrecommendeds
 * 获取某人创建的推荐.
 */
export let getMyRecommendeds = (req: Request, res: Response, next: NextFunction) => {
    // if (req.isAuthenticated()) {
    //   return res.end(401);
    // }
    console.log(req.query.userId);
    Recommended
      .find({ userId: req.query.userId })
    //   .where("passwordResetExpires").gt(Date.now())
      .exec((err, results) => {
        if (err) { return next(err); }
        res.json({code: 0, data: results});
      });
};
export let getRecommendedById = (req: Request, res: Response, next: NextFunction) => {
    console.log(req.params.id);
    Recommended
      .findById(req.params.id)
      .exec((err, results) => {
        if (err) { return next(err); }
        res.json({code: 0, data: results});
      });
};
export let delRecommendedById = (req: Request, res: Response, next: NextFunction) => {
    console.log(req.params.id);
    Recommended.remove({ _id: req.params.id }, function (err) {
        if (err) { return next(err); }
        res.json({code: 0, msg: "删除成功", data: {}});
      });
};
/**
 * POST /recommended
 * 某人创建新的推荐.
 */
export let postRecommended =  async (req: Request, res: Response, next: NextFunction) => {
    let recommended: any  = undefined;
    if (req.body._id) {
        recommended = await findById(req.body._id);
    } else {
        recommended = new Recommended();
    }
    recommended.title = req.body.title;
    recommended.images = req.body.images;
    recommended.description = req.body.description;
    recommended.userId = req.body.userId;

    console.log(req.body);
    console.log(recommended);
    recommended.save().then( async (doc: any) => {
        if (doc.barcode) {
            res.json({code: 0, data: doc});
        } else {
            const postBody = {
                path: "pages/show?id=" + doc._id
            };
            try {
                const result = await wechatHelper.getwxacode(postBody);
                if (result === "") throw new Error("调用获取二维码失败");
                console.log(result);
                recommended.barcode = result ;
                recommended.save().then(
                    (doc: any) => { res.json({code: 0, data: doc}); },
                    (err: any) => { res.json({code: 500, error: err}); }
                );
            } catch (err) {
                res.json({code: 500, error: err});
            }
        }
    }, (err2: any) => {
        res.json({code: 500, error: err2});
    });
};

export let postUpload = (req: Request, res: Response, next: NextFunction) => {
    console.log((req as any).file);
    console.log(__dirname);
    const fileName  = Date.now() + "." + (req as any).file.originalname;
    const newFileName = path.join((req as any).file.destination , fileName);
    console.log(newFileName);
    // 图片重命名
    fs.rename((req as any).file.path, newFileName , (err: any) => {
        if (err) {
            res.json({code: 500, error: "文件写入失败"});
        } else {
            // fs.unlinkSync(localFile);
            res.json({code: 0, data: {path: "/uploads/" + fileName, file: (req as any).file}});
        }
    });
};

const  findById =  (id: string) => {
    return new Promise(function(resolve, reject) {
        Recommended.findById(id)
        .exec((err, results) => {
            if (err) { return reject(err); }
            resolve(results);
          });
    });
};
