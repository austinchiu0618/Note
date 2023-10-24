# tsconfig.json 設定檔
```json
{
  "compileOnSave": false,    
    //編輯器在儲存檔案的時候根據tsconfig.json重新產生編譯檔案
  "compilerOptions": {
    /* 基本選項 */
    "target": "es5",    
      // 指定編譯生成的JS版本: 'ES3' (default), 'es5', 'es6/es2015', 'es2016', 'es2022', 'esnext' , ....
    "module": "commonjs", 
      // 指定生成哪種模組: 'commonjs' (default), 'amd', 'system', 'umd', 'es2015' , ....
    "lib": [],          
      // 編譯需要引入的特定函式庫檔案
    "allowJs": true,    
      // 允許編譯 javascript 文件
    "checkJs": true,    
      // 報告 javascript 文件中的錯誤
    "jsx": "preserve",  
      // 指定 jsx 代碼的生成: 'preserve', 'react-native', or 'react'
    "declaration": true, 
      // 生成相應的 '.d.ts' 文件
    "declarationMap": true,
      //生成宣告檔案的 sourceMap
    "sourceMap": true, 
      // 生成相應的 '.map' 文件
    "outFile": "./", 
      // 將輸出文件合併為一個文件
    "outDir": "./",      
      // 指定輸出目錄
    "rootDir": "./",     
      // 檔案應該要被放置的位置
    "composite": true,       
      // 是否编译构建引用项目
    "tsBuildInfoFile": "./", 
      // 指定文件存儲增量編譯信息，默認為 tsconfig.tsbuildinfo
    "removeComments": true,  
      // 刪除編譯後的所有的註釋
    "noEmit": true,          
      // 不產生輸出檔案
    "importHelpers": true,   
      // 從 tslib 導入輔助工具函數
    "isolatedModules": true,  
      // 將每個文件做為單獨的module（與 'ts.transpileModule' 類似）.

    /* 嚴格的類型檢查選項 */
    "strict": true,           
      // 啟用所有嚴格類型檢查選項                    
    "noImplicitAny": true,    
      // 在表達式和聲明上有隱含的 any類型時報錯                   
    "strictNullChecks": true,  
      // 啟用嚴格的 null 檢查                  
    "strictFunctionTypes": true,    
      //啟用檢查function型別        
    "strictBindCallApply": true,   
      //啟用對 bind, call, apply 更嚴格的型別檢查           
    "strictPropertyInitialization": true,     
      //啟用class实例属性的賦值檢查
    "noImplicitThis": true,    
      //當 this 表達式值為 any 類型的時候，生成一個錯誤                
    "alwaysStrict": true,     
      // 以嚴格模式檢查每個module，並在每個文件裡加入 'use strict'                  

    /* 額外的檢查 */
    "noUnusedLocals": true,   
      // 有未使用的變數時，拋出錯誤
    "noUnusedParameters": true,  
      // 有未使用的參數時，拋出錯誤
    "noImplicitReturns": true, 
      // 並不是所有function里的代碼都有返回值時，拋出錯誤
    "noFallthroughCasesInSwitch": true, 
      // 報告 switch 語句的 fallthrough 錯誤。 （即，不允許 switch 的 case 語句貫穿）
    "noUncheckedIndexedAccess": true, 
      //檢查 index signature 屬性是否是undefined     

    /* 模組選項 */
    "moduleResolution": "node",  
      // 選擇模組解析策略： 'node' (Node.js) or 'classic' (TypeScript pre-1.6)
    "baseUrl": "./",         
      // 用於解析非相對模組名稱的基目錄
    "paths": {},            
      // 模組名到基於 baseUrl 的路徑映射的列表
    "rootDirs": [],        
      // 根文件夾列表，其組合內容表示項目運行時的結構內容
    "typeRoots": [],       
      // 包含類型聲明的文件列表
    "types": [],          
      // 需要包含的類型聲明文件名列表
    "allowSyntheticDefaultImports": true,  
      // 允許從沒有設置默認導出的模組中默認導入。

    /* Source Map Options */
    "sourceRoot": "./",                    
      // 指定調試器應該找到 TypeScript 文件而不是源文件的位置
    "mapRoot": "./",                       
      // 指定調試器應該找到映射文件而不是生成文件的位置
    "inlineSourceMap": true,               
      // 生成單個 soucemaps 文件，而不是將 sourcemaps 生成不同的文件
    "inlineSources": true,                 
      // 將代碼與 sourcemaps 生成到一個文件中，要求同時設置了 --inlineSourceMap 或 --sourceMap 屬性

    /* 其他選項 */
    "experimentalDecorators": true,        
      // 啟用裝飾器
    "emitDecoratorMetadata": true,          
      // 為裝飾器提供元數據的支持
        
    /* 進階選項 */
    "skipLibCheck": true,                     
      //不會檢查引入的函式庫檔案
    "forceConsistentCasingInFileNames": true 
      // 確保檔案的大小寫一致
  },
  "files":[
    //若指定 files，則只會編譯指定的 hello.ts 檔案。
    "hello.ts"                           
  ],
  "exclude": [                               
    //指定編譯器需要排除的文件或文件夾
    "node_modules"
  ],
  "extends": "./tsconfig.base.json",        
   //把基礎配置抽離成tsconfig.base.json檔案，然後引入
  
  "references": [                             
    // 指定依赖的程式路徑
     {"path": "./common"}
  ],
  "typeAcquisition": {                       
    //自動引入函式庫相關定義文件(.d.ts)。
      "enable": false,
      "exclude": ["jquery"],
      "include": ["jest"]
  }
}
```
