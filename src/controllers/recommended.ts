
import * as async from "async";
import * as path from "path";
import { Request, Response, NextFunction } from "express";
import { WriteError } from "mongodb";

const request = require("express-validator");
const fs = require("fs");

import { default as Recommended, RecommendedModel } from "../models/Recommended";

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
        res.json(results);
      });
};
/**
 * POST /recommended
 * 某人创建新的推荐.
 */
export let postRecommended = (req: Request, res: Response, next: NextFunction) => {

    const recommended = new Recommended({
        title: req.body.title,
        images: req.body.images,
        description: req.body.description,
        userId: req.body.userId
    });
    console.log(req.body);
    console.log(recommended);
    const promise = recommended.save();
    promise.then(  (doc) => {
        res.json(doc);
    }, (err2) => {
        res.json(err2);
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
            res.json({code: 500, msg: "文件写入失败"});
        } else {
            // fs.unlinkSync(localFile);
            res.json({code: 200, data: {path: "/uploads/" + fileName, file: (req as any).file}});
        }
    });
//     var form = new multiparty.Form();
//     form.parse(request.payload, function(err, fields, files) {
//     fs.readFile(files.idCardFront[0].path,function(err,data){
//           if(!data || err){
//                return ryply({code:401,msg:"请上传身份证正面照片"});
//           }
//             var fileName = files.idCardFront[0].originalFilename;
//              var types = fileName.split('.'); //将文件名以.分隔，取得数组最后一项作为文件后缀名。
// var picType = String(types[types.length-1]).toLocaleLowerCase();
// if(picType=="jpg" || picType=="png" || picType=="jpeg"){
// var date = new Date();
//  var ms = Date.parse(date); //计算当前时间与1970年1月1日午夜相差的毫秒数 赋值给ms以确保文件名无重复。
//  forntPath = appDir+"/kycFiles/front"+ ms +"." + String(types[types.length-1]);
//  fs.renameSync(files.idCardFront[0].path, forntPath);
//             }else{
//               return reply({code:411,msg:"身份证正面照片格式不正确"});
//              }
//         })
// ｝；
};

