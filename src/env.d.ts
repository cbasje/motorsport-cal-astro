/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly DATABASE_URL: string;
    readonly DATABASE_DEV_URL: string;
    readonly INCLUDED_SERIES: string;

    readonly F1A_API_KEY: string;
    readonly F2_API_KEY: string;
    readonly F3_API_KEY: string;

    readonly MAP_API_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
