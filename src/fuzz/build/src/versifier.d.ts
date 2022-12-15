/// <reference types="node" />
interface Node {
    Visit: any;
    Generate: (w: DynamicBuffer, v: Verse) => void;
}
declare class DynamicBuffer {
    private len;
    private buffer;
    private offset;
    constructor(len?: number);
    Write(p: Buffer): void;
    Bytes(): Buffer;
}
export declare class BlockNode {
    nodes: Node[];
    constructor(nodes: Node[]);
    Visit(f: (n: Node) => void): void;
    Generate(w: DynamicBuffer, v: Verse): void;
}
export declare function BuildVerse(oldv: Verse | null, data: Buffer): Verse | null;
export declare class Verse {
    blocks: BlockNode[];
    allNodes: Node[];
    Rhyme(): Buffer;
    Rand(n: number): number;
}
export {};
