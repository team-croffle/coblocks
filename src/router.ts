import { createRouter } from "@tanstack/react-router";
// @ts-ignore
import { routeTree } from "./routeTree.gen.ts";

export const router = createRouter({ routeTree });