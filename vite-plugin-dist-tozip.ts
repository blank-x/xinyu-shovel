import fs from 'fs';
import  zlib from 'zlib';
import type {Plugin, ResolvedConfig} from "vite";
import path from "path";

export default function () {
  let viteConfig: ResolvedConfig;
  return {
    name: 'vite-plugin-dist-gz',
    apply: 'build',
    enforce: 'post',
    configResolved(resolvedConfig) {
      // 存储最终解析的配置
      viteConfig = resolvedConfig;
    },
    closeBundle() {
      const distDir = path.resolve(viteConfig.root, viteConfig.build.outDir);
      console.log(distDir)
      const zipFullName = `render.gz`;
      // const writeStream = fs.createWriteStream(compressedFilePath);


    }
  }
}

//
// const folderPath = '/path/to/folder';
// const compressedFilePath = '/path/to/compressed-file.gz';
//
// // 创建可写流，将压缩数据写入文件
// const writeStream = fs.createWriteStream(compressedFilePath);
//
// // 创建 gzip 压缩流
// const gzip = zlib.createGzip();
//
// // 读取文件夹下的所有文件，并将数据通过 gzip 压缩后写入文件
// fs.readdir(folderPath, (err, files) => {
//   if (err) {
//     console.error('Failed to read folder:', err);
//     return;
//   }
//
//   // 遍历文件夹下的所有文件
//   files.forEach((file) => {
//     const filePath = folderPath + '/' + file;
//
//     // 创建可读流，读取文件数据
//     const readStream = fs.createReadStream(filePath);
//
//     // 将读取的文件数据通过 gzip 压缩后写入可写流
//     readStream.pipe(gzip).pipe(writeStream);
//   });
//
//   console.log('Folder compressed successfully.');
// });
