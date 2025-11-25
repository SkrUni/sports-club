import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    return NextResponse.json({
      success: true,
      message: 'Тестовый endpoint работает',
      received: {
        email,
        passwordLength: password?.length || 0
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Ошибка' },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}



