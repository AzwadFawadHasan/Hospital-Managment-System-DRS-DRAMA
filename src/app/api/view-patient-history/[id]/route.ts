import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = (await params).id;
  const patientId = parseInt(id);

  if (isNaN(patientId)) {
    return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });
  }

  try {
    const patient = await prisma.patient.findUnique({
      where: { patient_id: patientId },
      include: {
        Prescription: {
          orderBy: { prescribed_at: "asc" },
          include: {
            doctor: true,
            items: {
              include: {
                medicine: true,
              },
            },
            treatmentItems: {
              include: {
                treatment: true,
              },
            },
          },
        },
        Invoice: {
          orderBy: { invoice_creation_date: "asc" },
          include: {
            doctor: true,
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const patientInfo = {
      patient_id: patient.patient_id,
      patient_name: patient.patient_name,
      email: patient.email || "",
      mobile_number: patient.mobile_number || "",
      gender: patient.gender || "",
      age: patient.age || "",
      blood_group: patient.blood_group || "",
      weight: patient.weight || "",
      emergency_contact_phone: patient.emergency_contact_phone || "",
      image_url: patient.image_url || "/uploads/default.avif",
      onboarded_at: patient.created_at.toISOString(),
    };

    const prescriptions = patient.Prescription.map((prescription) => ({
      prescription_id: prescription.prescription_id,
      prescribed_at: prescription.prescribed_at.toISOString(),
      total_cost: prescription.total_cost || 0,
      prescribed_doctor_name: prescription.doctor?.doctor_name || "Unknown",
      is_drs_derma: prescription.is_drs_derma || "",
      doctor_image_url: prescription.doctor?.doctor_image || "/uploads/default.avif",
      doctor_fee: prescription.doctor?.doctor_fee ? Number(prescription.doctor.doctor_fee) : 0,
      doctor_id: prescription.doctor?.doctor_id ? Number(prescription.doctor.doctor_id) : 0,
      advise: prescription.advise || "",
      next_visit_date: prescription.next_visit_date?.toISOString() || "",
      medicine_items: prescription.items.map((item) => ({
        item_id: item.item_id,
        medicine_name: item.medicine?.name || "Unknown",
        dose_morning: item.dose_morning || "",
        dose_mid_day: item.dose_mid_day || "",
        dose_night: item.dose_night || "",
        duration_days: item.duration_days || 0,
      })),
      treatment_items: prescription.treatmentItems.map((treatmentItem) => ({
        treatment_name: treatmentItem.treatment?.treatment_name || "Unknown",
        // duration_months: treatmentItem.duration_months || 0,
        payable_treatment_amount: treatmentItem.payable_treatment_amount || 0,
        discount_type: treatmentItem.discount_type || "None",
        discount_value: treatmentItem.discount_value || 0,
      })),
    }));

    const payments = patient.Invoice.map((invoice) => ({
      payment_id: invoice.invoice_id,
      invoice_id: invoice.invoice_id,
      invoice_number: invoice.invoice_number,
      previous_due: invoice.previous_due,
      previous_session_date: invoice.previous_session_date,
      next_session_date: invoice.next_session_date,
      due_amount: invoice.due_amount,
      paid_at: invoice.invoice_creation_date?.toISOString() || null,
      amount: invoice.paid_amount || 0,
      payment_method: invoice.payment_method || "Unknown",
      // collected_by: invoice.doctor?.doctor_name || "Unknown",
    }));

    const finalResponse = {
      patient: patientInfo,
      prescriptions: prescriptions,
      payments: payments,
    };

    return NextResponse.json(finalResponse);
  } catch (error) {
    console.error("Error fetching patient history:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}