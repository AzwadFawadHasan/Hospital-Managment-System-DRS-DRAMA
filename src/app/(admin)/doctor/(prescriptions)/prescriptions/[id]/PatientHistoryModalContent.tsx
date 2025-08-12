import Image from "next/image";
import React from 'react';

// Assuming you have these interfaces defined in a separate file or can copy them here
// from your page.tsx
interface PatientInfo {
    patient_id: number;
    patient_name: string;
    email: string;
    mobile_number: string;
    gender: string;
    age: string;
    blood_group: string;
    weight: string;
    emergency_contact_phone: string;
    image_url?: string;
    onboarded_at?: string;
}

interface PrescriptionItem {
    item_id: number;
    medicine_name: string;
    dose_morning: string;
    dose_mid_day: string;
    dose_night: string;
    duration_days: number;
}

interface TreatmentItem {
    treatment_name: string;
    duration_months?: number;
    payable_treatment_amount: number;
    discount_type: string;
    discount_value: number;
}

interface PaymentItem {
    payment_id: number;
    invoice_number: string;
    previous_session_date: string;
    next_session_date: string;
    previous_due: number;
    paid_at: string;
    amount: number;
    payment_method: string;
    due_amount: string;
    collected_by: string;
}

interface Prescription {
    prescription_id: number;
    prescribed_at: string;
    total_cost: number;
    prescribed_doctor_name: string;
    is_drs_derma: string;
    doctor_image_url?: string;
    doctor_fee?: number;
    advise: string;
    next_visit_date: string;
    medicine_items: PrescriptionItem[];
    treatment_items: TreatmentItem[];
}

interface PatientHistoryResponse {
    patient: PatientInfo;
    prescriptions: Prescription[];
    payments?: PaymentItem[];
}


interface PatientHistoryModalProps {
  data: PatientHistoryResponse;
}

const PatientHistoryModalContent: React.FC<PatientHistoryModalProps> = ({ data }) => {
  if (!data || !data.patient) {
    return <div>No history available.</div>;
  }
  
  // You can keep the `groupedTimeline` logic from your page.tsx here if needed
  // or simply render the data directly in a list format.
  // Below is an example of a simple list rendering.

  return (
    <div className="p-4">
      <div className="flex items-center space-x-4 mb-4">
        {data.patient?.image_url && data.patient.image_url.trim() !== "" && (
          <Image
            src={data.patient.image_url}
            alt={`${data.patient.patient_name}'s photo`}
            width={80}
            height={80}
            className="rounded-full object-cover"
          />
        )}
        <div>
          <h3 className="text-xl font-bold">{data.patient.patient_name}</h3>
          <p className="text-sm text-gray-600">{data.patient.email}</p>
        </div>
      </div>

      <h4 className="text-lg font-semibold mt-4">Prescriptions</h4>
      {data.prescriptions.length > 0 ? (
        data.prescriptions.map((p, index) => (
          <div key={index} className="border-b pb-2 mb-2 last:border-b-0">
            <p><strong>Date:</strong> {new Date(p.prescribed_at).toLocaleDateString()}</p>
            <p><strong>Doctor:</strong> {p.prescribed_doctor_name}</p>
            <p><strong>Advise:</strong> {p.advise}</p>
            
            {p.medicine_items.length > 0 && (
                <div className="mt-2">
                    <strong>Medicines:</strong>
                    <ul>
                        {p.medicine_items.map((m, mIdx) => (
                            <li key={mIdx}>{m.medicine_name} - M:{m.dose_morning}, A:{m.dose_mid_day}, N:{m.dose_night} ({m.duration_days} days)</li>
                        ))}
                    </ul>
                </div>
            )}
            
            {p.treatment_items.length > 0 && (
                <div className="mt-2">
                    <strong>Treatments:</strong>
                    <ul>
                        {p.treatment_items.map((t, tIdx) => (
                            <li key={tIdx}>{t.treatment_name} (Fee: ৳{t.payable_treatment_amount})</li>
                        ))}
                    </ul>
                </div>
            )}

            <p className="mt-2"><strong>Total Cost:</strong> ৳{p.total_cost}</p>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No prescriptions found.</p>
      )}

      <h4 className="text-lg font-semibold mt-4">Payments</h4>
      {data.payments && data.payments.length > 0 ? (
        data.payments.map((p, index) => (
          <div key={index} className="border-b pb-2 mb-2 last:border-b-0">
            <p><strong>Date:</strong> {new Date(p.paid_at).toLocaleDateString()}</p>
            <p><strong>Amount Paid:</strong> ৳{p.amount}</p>
            <p><strong>Due Amount:</strong> ৳{p.due_amount}</p>
            <p><strong>Collected By:</strong> {p.collected_by}</p>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No payment history found.</p>
      )}
    </div>
  );
};

export default PatientHistoryModalContent;