"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

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

interface GroupedEvent {
  date: string;
  formattedDate: string;
  events: {
    title: string;
    description: string;
    author: string;
    color: string;
    participants: string[];
  }[];
}
export default function Page() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<PatientHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/view-patient-history/${id}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const result = await res.json();
        if (result) {
          setData({
            patient: result.patient,
            prescriptions: result.prescriptions,
            payments: result.payments || [],
          });
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [id]);

  const getDateKey = (dateStr: string) =>
    new Date(dateStr).toISOString().split("T")[0];

  const formatDate = (dateStr: string): string =>
    new Date(dateStr).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data || !data.patient) return <div className="p-6">No data available.</div>;

  const groupedTimeline: { [key: string]: GroupedEvent } = {};

  data.prescriptions.forEach((p) => {
    const dateKey = getDateKey(p.prescribed_at);
    const doctor = p.prescribed_doctor_name;
    const doctorImage = p.doctor_image_url || "/uploads/default.avif";
    // const patientImage = p.image_url || "/uploads/default.avif";

    // let fullDescription = `Advise: ${p.advise}. Total cost: ৳${p.total_cost}.`;

    // if (p.medicine_items.length > 0) {
    //   p.medicine_items.forEach((m) => {
    //     fullDescription += ` Medicine: ${m.medicine_name} (M-${m.dose_morning}, A-${m.dose_mid_day}, N-${m.dose_night}, ${m.duration_days} days).`;
    //   });
    // }

    // if (p.treatment_items.length > 0) {
    //   p.treatment_items.forEach((t) => {
    //     fullDescription += ` Treatment: ${t.treatment_name} (Fee: ৳${t.payable_treatment_amount}, Discount: ${t.discount_value}${t.discount_type === "Percentage" ? "%" : ""}).`;
    //   });
    // }
    let treatmentSection = "";
    let medicineSection = "";
    let treatmentSubtotal = 0;
    // let medicineSubtotal = 0;
    const doctorFee = p.doctor_fee || 0;

    if (p.treatment_items.length > 0) {
      treatmentSection += "Treatments:\n";
      p.treatment_items.forEach((t) => {
        treatmentSubtotal += t.payable_treatment_amount || 0;
        treatmentSection += `• ${t.treatment_name} (Fee: ৳${t.payable_treatment_amount}, Discount: ${t.discount_value}${t.discount_type === "Percentage" ? "%" : ""})\n`;
      });
    }

    if (p.medicine_items.length > 0) {
      medicineSection += "Medicines:\n";
      p.medicine_items.forEach((m) => {
        medicineSection += `• ${m.medicine_name} (M-${m.dose_morning}, A-${m.dose_mid_day}, N-${m.dose_night}, ${m.duration_days} days)\n`;
      });
    }

    let fullDescription = "";

    if (treatmentSection) fullDescription += `${treatmentSection}\n`;
    if (medicineSection) fullDescription += `${medicineSection}\n`;

    // fullDescription += `Advise:\n${p.advise}\n\nTotal cost: ৳${p.total_cost}`;
    // fullDescription += `Advise:\n${p.advise}\n\nDoctor Fee: ৳${doctorFee}\nTreatment Fee: ৳${treatmentSubtotal}\nTotal cost: ৳${p.total_cost}`;
    fullDescription += `Advise:\n${p.advise}\n\n`;

    fullDescription += `Treatment Subtotal: ৳${treatmentSubtotal}\n`;
    // fullDescription += `Medicine Subtotal: ৳${medicineSubtotal}\n`;
    fullDescription += `Doctor Fee: ৳${doctorFee}\n`;
    // fullDescription += `---------------------\n`;
    fullDescription += `Total cost: ৳${p.total_cost}`;


    if (!groupedTimeline[dateKey]) {
      groupedTimeline[dateKey] = {
        date: dateKey,
        formattedDate: formatDate(p.prescribed_at),
        events: [],
      };
    }
  // Function to generate a random color from a predefined set
  const getRandomColor = (): string => {
    const colors = ["bg-success-500", "bg-orange-500", "bg-purple-500", "bg-secondary-500", "bg-blue-500", "bg-red-500"];
    return colors[Math.floor(Math.random() * colors.length)];
  };
    groupedTimeline[dateKey].events.push({
      title: `Prescribed by Dr. ${doctor}`,
      description: fullDescription,
      author: doctor,
      color: getRandomColor(),//"bg-red-500",
      participants: [doctorImage] ,
    });

    if (p.next_visit_date) {
      const nextVisitKey = getDateKey(p.next_visit_date);
      if (!groupedTimeline[nextVisitKey]) {
        groupedTimeline[nextVisitKey] = {
          date: nextVisitKey,
          formattedDate: formatDate(p.next_visit_date),
          events: [],
        };
      }
      groupedTimeline[nextVisitKey].events.push({
        title: `Appointment with Dr. ${doctor}`,
        description: `Scheduled for next visit.`,
        author: doctor,
        color: "bg-yellow-500",
        participants: [],
      });
    }
  });


  data.payments?.forEach((p) => {
    const dateKey = getDateKey(p.paid_at);
    if (!groupedTimeline[dateKey]) {
      groupedTimeline[dateKey] = {
        date: dateKey,
        formattedDate: formatDate(p.paid_at),
        events: [],
      };
    }
    // groupedTimeline[dateKey].events.push({
    //   // title: `Payment of ৳${p.amount}`,
    //   title: `Invoice Details:`,
    //   // title: `Invoice Details, of ${p.invoice_number}`,
    //   // description: `Paid via ${p.payment_method}. Collected by ${p.collected_by}.`,
    //   author: p.collected_by,
    //   color: "bg-green-600",
    //   participants: [],
    //   description: ""
    // });

    let invoiceDesc = "";

    if (p.invoice_number) {
      invoiceDesc += `• Invoice #: ${p.invoice_number}`;
      if (p.paid_at) {
        const invoiceDate = new Date(p.paid_at).toISOString().split("T")[0];
        invoiceDesc += ` (${invoiceDate})\n`;
      } else {
        invoiceDesc += `\n`;
      }
    }

    if (p.previous_due != null) {
      invoiceDesc += `• Previous Due: ৳${p.previous_due}\n`;
    }

    if (p.amount != null) {
      invoiceDesc += `• Paid Amount: ৳${p.amount}\n`;
    }

    if (p.previous_session_date) {
      invoiceDesc += `• Previous Session Date: ${p.previous_session_date}\n`;
    }

    if (p.next_session_date) {
      invoiceDesc += `• Next Session Date: ${p.next_session_date}\n`;
    }

    // if (p.payment_method) {
    //   invoiceDesc += `• Payment Method: ${p.payment_method}\n`;
    // }

    // if (p.payment_type) {
    //   invoiceDesc += `• Payment Type: ${p.payment_method}\n`;
    // }

    if (p.due_amount != null) {
      invoiceDesc += `• Total Due Amount: ৳${p.due_amount}\n`;
    }

    groupedTimeline[dateKey].events.push({
      title: `Invoice Details:`,
      description: invoiceDesc,
      author: p.collected_by,
      color: "bg-green-600",
      participants: [],
    });

  });



  const sortedGroupedTimeline = Object.values(groupedTimeline).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="p-6 space-y-6">
      {/* <h2 className="text-2xl font-bold mb-4">
        Medical History Timeline for {data.patient.patient_name}
      </h2> */}
      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <div className="trezo-card-header mb-[25px] flex items-center justify-between">
          {/* <h3 className="!mb-0">Timeline</h3>
           */}
          <h2 className="text-2xl font-bold mb-4">
              Medical History Timeline for {data.patient.patient_name}
          </h2>
          {data?.patient?.image_url && data.patient.image_url.trim() !== "" && (
            <div className="w-30 h-30 rounded-full overflow-hidden">
                <Image
                  src={data.patient.image_url}
                  alt={`${data.patient.patient_name}'s photo`}
                  width={120} 
                  height={120} 
                  className="w-full h-full object-cover"
                />
            </div>
          )}

        </div>
        <div className="trezo-card-content pt-[10px] pb-[25px]">
          <div className="relative">
            <span className="block absolute top-0 bottom-0 left-[6px] md:left-[150px] mt-[5px] border-l border-dashed border-gray-100 dark:border-[#172036]"></span>

            {sortedGroupedTimeline.length > 0 ? (
              sortedGroupedTimeline.map((group, index) => (
                <div key={index} className="relative pl-[25px] md:pl-[180px] mb-[40px]">
                  <span className="md:absolute md:top-0 md:left-0 text-sm block mb-[10px] md:mb-0 w-[120px] text-right font-semibold text-blue-600 dark:text-blue-300">
                    {group.formattedDate}
                  </span>

                  {group.events.length > 0 && (
                    <div className="mb-[25px]">
                      {/* <span
                        className={`block w-[12px] h-[12px] rounded-full ${group.events[0].color} mb-[5px]`}
                      ></span> */}

                      {group.events.map((event, idx) => (
                        <div key={idx} className="mb-[16px]">
                          {/* <span className="block text-black dark:text-white font-medium"> */}
                          <span className="block text-black dark:text-white font-semibold text-lg">

                            {event.title}
                          </span>
                          {/* <p className="text-sm leading-[1.7] mb-[8px]"> */}
                          <p className="text-sm leading-[1.7] mb-[8px] whitespace-pre-line">
                            {event.description}
                          </p>

                          {/* {event.participants.length > 0 && (
                            <div className="flex items-center mb-[8px]">
                              {event.participants.map((user, id) => (
                                <div
                                  key={id}
                                  className="w-[40px] h-[40px] rounded-full -mr-[12px] border-2 border-white"
                                >
                                  {/* <Image
                                    src={user}
                                    alt="participant"
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                  /> */}
                                {/* </div> */}
                              {/* ))} */}
                            {/* </div> */}
                          {/* //)}  */}
                        </div>
                      ))}

                      <span className="block text-sm">
                        {/* By:{" "}
                        <span className="text-primary-500">
                          {group.events[0].author}
                        </span> */}
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No history available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
