// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
    const cookieLang = request.cookies.get('lang')?.value;
    
    const locale = cookieLang || 'ar';
    
    const response = NextResponse.next();
    response.headers.set('x-lang', locale); 
    return response;
}