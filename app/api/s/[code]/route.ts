import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { kv } from '@vercel/kv';
import { ShortLinkData } from "@/utils/service";

export async function GET(request: NextRequest) {

    const pathname = request.nextUrl.pathname;
    const code = pathname.split('/').pop();
    if (!code) {
        return NextResponse.json({ message: '网址无效' });
    }

    const data = (await kv.get(code)) as ShortLinkData
    if (!data || !data.url) {
        return NextResponse.json({ message: '找不到网址' }, { status: 404 });
    }

    return NextResponse.redirect(data.url, 302);
}