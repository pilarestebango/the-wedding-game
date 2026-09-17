// Single shared TouchControls DOM instance — built once, reused by every scene.
import { TouchControls } from './TouchControls.js';

export const touchControls = new TouchControls();
