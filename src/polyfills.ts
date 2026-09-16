import { Buffer } from 'buffer';

const globals = globalThis as unknown as { Buffer?: typeof Buffer; global?: typeof globalThis };

if (!globals.Buffer) globals.Buffer = Buffer;
if (!globals.global) globals.global = globalThis;
