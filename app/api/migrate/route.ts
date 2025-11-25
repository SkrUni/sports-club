import { NextResponse } from 'next/server';
import { migrateDatabase } from '@/lib/database';

export async function POST() {
  try {
    migrateDatabase();
    
    return NextResponse.json({
      message: 'Миграция выполнена успешно'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка миграции' },
      { status: 500 }
    );
  }
}



