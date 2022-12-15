// 
// export declare class Corpus {
//     private inputs;
//     private corpusPath;
//     private maxInputSize;
//     private seedLength;
//     private readonly onlyAscii;
//     constructor(dir: string[], onlyAscii: boolean);
//     loadFiles(dir: string): void;
//     getLength(): number;
//     generateInput(): Buffer;
//     putBuffer(buf: Buffer): void;
//     randBool(): boolean;
//     rand(n: number): number;
//     dec2bin(dec: number): string;
//     Exp2(): number;
//     chooseLen(n: number): number;
//     toAscii(buf: Buffer): void;
//     mutate(buf: Buffer): Buffer;
// }
/// <reference types="node" />
export declare class Corpus {
    
    getLength(): number;
    generateInput(): Buffer;
  }
