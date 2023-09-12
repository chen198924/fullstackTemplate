import path from 'path';
import { configure, getLogger } from 'log4js';
import { getClientIP } from './common';

// 日志配置对象
configure({
    // 日志记录方式
    appenders: {
        // 自定义category为error，记录服务器报错信息
        error: {
            type: 'file',//日志类型 指定单一文件存储
            filename: path.join('logs/', 'error/error.log'), //日志输出位置，当目录文件或文件夹不存在时自动创建
            maxLogSize: 1024 * 1024 * 1024 * 50, // 文件最大存储空间，单位是字节 1024k 1m
            backups: 100  //当文件内容超过文件存储空间时，备份文件的数量
        },
        // 自定义category为response，记录服务器的响应情况 用户访问服务的情况
        response: {
            type: 'dateFile', // 以日期命名的文件记录日志
            filename: path.join('logs/', 'access/response'),
            pattern: 'yyyy-MM-dd.log', //日志输出模式
            alwaysIncludePattern: true,

            // dateFile类型的appender没有这个选项
            maxLogSize: 1024 * 1024 * 1024 * 50,
            // dateFile类型的appender没有这个选项
            backups: 100,
            numBackups:100
        },
        console: {
            type: "console",
            layout: {
                // 开发环境下带颜色输出，生产环境下使用基本输出
                type: process.env.isProd === 'true' ? 'basic' : 'coloured'
            }
        }
    },
    // log4js.getLogger(type)：就是读取这里的key
    categories: {
        error: { appenders: ['error'], level: 'error' },
        response: { appenders: ['response'], level: 'info' },
        default: { appenders: ['console'], level: 'all' }
    }
});

// 自定义输出格式，确定哪些内容输出到日志文件中
const formatError = (req: any, res: any, err: any) => {
    const ip = getClientIP(req)


    const { method, url, body } = req

    // 将请求方法，请求路径，请求体，错误信息
    return { ip, method, url, body, err }
}

const formatRes = (req: any, res: any, costTime: any) => {
    const ip = getClientIP(req)


    const { method, url, body } = req
    const { statusCode, statusMessage } = res

    const authorization = req.header('authorization')

    // 将请求方法，请求路径，请求体，请求消耗时间，请求头中的authorization字段即token，响应体中的状态码，消息，以及自定义的响应状态
    return { ip, method, url, body, costTime, authorization, response: { statusCode, statusMessage } }
}

// 生成一个error类型的日志记录器
let errorLogger = getLogger('error')

// 生成一个response类型的日志记录器
let resLogger = getLogger('response')

// 生成一个控制台类型的日志记录器
let console = getLogger()

// 封装错误日志
export const errLoggerCustom = (req: any, res: any, error: any) => {
    if (req && res && error) {
        errorLogger.error(formatError(req, res, error))
    }
}

// 封装响应日志
export const resLoggerCustom = (req: any, res: any, resTime: any) => {
    if (req && res) {
        resLogger.info(formatRes(req, res, resTime))
    }
}

// 控制台输出
export const log = console