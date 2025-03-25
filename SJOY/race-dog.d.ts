interface DataType {
  width: number
  height: number
  assetRootSrc: string
  isMuteAll: boolean
  background: string
  currIssue: number
  preIssue: number
  preNum: number[]
  onRunStart: ()=> void
  onClose: ()=> void
  onReady: ()=> void
  onFinshGame: ()=> void
  onFinshLine?: ()=> void
  onMuteAll?: ()=> void
}

declare module 'race-dog'{
  export default class RaceDogGame {
    constructor(root:Element, data:DataType)

    loaderAssets(): void

    createScene(): void

    removeScene(): void

    resetGame(): void

    rendererResize(width?:number, height?:number): void

    calculateStageSize(
      screenWidth:number, screenHeight:number,
      contentWidth:number, contentHeight:number
      ):{
        stageWidth: number,
        stageHeight: number,
        displayWidth: number,
        displayHeight: number
      }

    setOnMuteAll(fn:()=>void): void

    setReadyCallBack(fn:()=>void): void

    setFinshLineCallBack(fn:()=>void): void

    setFinshGameCallBack(fn:()=>void): void

    setIssue(currIssue:number, preIssue:number): void

    setPreRank(nums:number[]): void

    setBackGround(key: string): void

    setCommercial(urls:string[]): void

    setSeed(num:number): void

    startCountdown(second:number): void

    midGame(): void

    finishGame(numbers:number[]): void

    randomFinshTest(): void
  }
}
