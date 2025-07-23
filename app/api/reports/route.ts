import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const reportData = await request.json();

    // Prepare data for Supabase
    const report = {
      income: reportData.income,
      deposit: reportData.deposit,
      stamp: reportData.stamp,
      balance: reportData.balance,
      mgvcl: reportData.mgvcl,
      expences: reportData.expences,
      online: reportData.onlinePayment, // Map onlinePayment to online field
      totals: reportData.totals,
      username: reportData.username, // Add username field
      timestamp: reportData.timestamp || new Date().toISOString(),
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('reports')
      .insert([report])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to save report to database' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Report saved successfully',
      reportId: data[0].id 
    });
  } catch (error) {
    console.error('Error saving report:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save report' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch reports' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const reportId = url.searchParams.get('id');

    if (!reportId) {
      return NextResponse.json(
        { success: false, message: 'Report ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to delete report' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Report deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete report' },
      { status: 500 }
    );
  }
}