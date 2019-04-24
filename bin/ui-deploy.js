#! /usr/bin/env node
/* eslint-disable no-console */

var Minio = require('minio')
var program = require('commander')
var fs = require('fs')
var path = require('path')
var glob = require('glob')
var mime = require('mime-types')

program
  .version('0.0.0')
  .option('-b, --bucket [bucket]', 'Which bucket deploy to ?', 'assets')
  .option('-p, --prefix [prefix]', 'Prefix key', 'assets')
  .option('-d, --working-dir [working-dir]', 'Working directory', null)
  .parse(process.argv)

const bucket = program['bucket']
const prefix = program['prefix']

var minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || '',
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY || 'none',
  secretKey: process.env.MINIO_SECRET_KEY || 'none'
})

const defaultWorkDir = process.cwd()
const workingDir = program['working-dir'] || defaultWorkDir

console.log(`Working on ${workingDir}`)

const distDir = workingDir + '/dist'
const pattern = `**/*.+(js|css|html|png|jpeg|jpg|map|ico)`

glob(
  pattern,
  {
    cwd: distDir
  },
  (err, files) => {
    files.forEach(file => {
      minioClient.fPutObject(
        bucket,
        prefix + file,
        `${distDir}/${file}`,
        {
          'Content-Type': mime.lookup(file) || 'application/octet-stream'
        },
        (err, result) => {
          if (err) return console.log(err)
          console.log(result)
        }
      )
    })
  }
)
