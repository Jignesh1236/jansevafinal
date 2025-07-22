
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { password, page } = await request.json();

    if (!password || !page) {
      return NextResponse.json(
        { success: false, message: 'Password and page are required' },
        { status: 400 }
      );
    }

    // Check if password exists for the page
    const { data, error } = await supabase
      .from('userdata')
      .select('*')
      .eq('page', page)
      .eq('password', password)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Authentication successful',
      role: data.role 
    });
  } catch (error) {
    console.error('Error authenticating user:', error);
    return NextResponse.json(
      { success: false, message: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { password, page, role } = await request.json();

    if (!password || !page) {
      return NextResponse.json(
        { success: false, message: 'Password and page are required' },
        { status: 400 }
      );
    }

    // First, try to update the existing record
    const { data: updateData, error: updateError } = await supabase
      .from('userdata')
      .update({
        password: password,
        role: role || 'user'
      })
      .eq('page', page)
      .select();

    // If update worked (found existing record), return success
    if (!updateError && updateData && updateData.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Password updated successfully' 
      });
    }

    // If no existing record found, insert a new one
    const { data: insertData, error: insertError } = await supabase
      .from('userdata')
      .insert([
        {
          password: password,
          page: page,
          role: role || 'user'
        }
      ])
      .select();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json(
        { success: false, message: 'Failed to save password' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Password saved successfully' 
    });
  } catch (error) {
    console.error('Error saving password:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save password' },
      { status: 500 }
    );
  }
}
