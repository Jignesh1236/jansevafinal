import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Report ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);

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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Report ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch report' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updatedData = await request.json();

    const { data, error } = await supabase
      .from('reports')
      .update({
        income: updatedData.income,
        deposit: updatedData.deposit,
        stamp: updatedData.stamp,
        balance: updatedData.balance,
        mgvcl: updatedData.mgvcl,
        expences: updatedData.expences,
        onlinePayment: updatedData.onlinePayment,
        totals: updatedData.totals,
        last_modified: updatedData.lastModified,
        audit_log: updatedData.auditLog,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating report:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update report' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Report updated successfully',
      data: data
    });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update report' },
      { status: 500 }
    );
  }
}