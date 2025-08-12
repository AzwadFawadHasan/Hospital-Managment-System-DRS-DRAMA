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
  doctor_id: number;
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
    prescription_id?: number;
    doctor_id?: number;
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

  // Helper for random colors
  const getRandomColor = (): string => {
    const colors = [
      "bg-success-500",
      "bg-orange-500",
      "bg-purple-500",
      "bg-secondary-500",
      "bg-blue-500",
      "bg-red-500",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Build prescription events
  data.prescriptions.forEach((p) => {
    const dateKey = getDateKey(p.prescribed_at);
    const doctor = p.prescribed_doctor_name;
    const doctorImage = p.doctor_image_url || "/uploads/default.avif";

    let treatmentsHTML = "";
    let medicineHTML = "";
    let costHTML = "";
    let treatmentSubtotal = 0;
    const doctorFee = p.doctor_fee || 0;

    if (p.treatment_items.length > 0) {
      treatmentsHTML += "<ul>";
      p.treatment_items.forEach((t) => {
        treatmentSubtotal += t.payable_treatment_amount || 0;
        treatmentsHTML += `<li>${t.treatment_name} (Fee: ৳${t.payable_treatment_amount}, Discount: ${t.discount_value}${t.discount_type === "Percentage" ? "%" : ""})</li>`;
      });
      treatmentsHTML += "</ul>";
    }

    if (p.medicine_items.length > 0) {
      medicineHTML += "<ul>";
      p.medicine_items.forEach((m) => {
        medicineHTML += `<li>${m.medicine_name} (M-${m.dose_morning}, A-${m.dose_mid_day}, N-${m.dose_night}, ${m.duration_days} days)</li>`;
      });
      medicineHTML += "</ul>";
    }

    if (p.advise && p.advise.trim() !== "") {
      treatmentsHTML += `<p><strong>Advise:</strong> ${p.advise}</p>`;
    }

    costHTML += `<p><strong>Treatment Subtotal:</strong> ৳${treatmentSubtotal}</p>`;
    costHTML += `<p><strong>Doctor Fee:</strong> ৳${doctorFee}</p>`;
    costHTML += `<p><strong>Total Cost:</strong> ৳${p.total_cost}</p>`;

    const descriptionHTML = JSON.stringify({
      invoice: null,
      treatments: treatmentsHTML + medicineHTML,
      cost: costHTML,
    });

    if (!groupedTimeline[dateKey]) {
      groupedTimeline[dateKey] = {
        date: dateKey,
        formattedDate: formatDate(p.prescribed_at),
        events: [],
      };
    }

    groupedTimeline[dateKey].events.push({
      title: `Prescribed by ${doctor}`,
      description: descriptionHTML,
      author: doctor,
      color: getRandomColor(),
      participants: [doctorImage],
      prescription_id: p.prescription_id,
      doctor_id: p.doctor_id,
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
        description: JSON.stringify({ invoice: null, treatments: "", cost: "" }),
        author: doctor,
        color: "bg-yellow-500",
        participants: [],
      });
    }
  });

  // Build payment events
  data.payments?.forEach((p) => {
    const dateKey = getDateKey(p.paid_at);
    if (!groupedTimeline[dateKey]) {
      groupedTimeline[dateKey] = {
        date: dateKey,
        formattedDate: formatDate(p.paid_at),
        events: [],
     
      };
    }

    let invoiceHTML = "";
    if (p.invoice_number) {
      invoiceHTML += `<p><strong>Invoice #:</strong> ${p.invoice_number}</p>`;
      if (p.paid_at) {
        const invoiceDate = new Date(p.paid_at).toISOString().split("T")[0];
        invoiceHTML += `<p><strong>Date:</strong> ${invoiceDate}</p>`;
      }
    }
    if (p.previous_due != null) {
      invoiceHTML += `<p><strong>Previous Due:</strong> ৳${p.previous_due}</p>`;
    }
    if (p.amount != null) {
      invoiceHTML += `<p><strong>Paid Amount:</strong> ৳${p.amount}</p>`;
    }
    if (p.previous_session_date) {
      invoiceHTML += `<p><strong>Previous Session Date:</strong> ${p.previous_session_date}</p>`;
    }
    if (p.next_session_date) {
      invoiceHTML += `<p><strong>Next Session Date:</strong> ${p.next_session_date}</p>`;
    }
    if (p.due_amount != null) {
      invoiceHTML += `<p><strong>Total Due Amount:</strong> ৳${p.due_amount}</p>`;
    }

    const descriptionHTML = JSON.stringify({
      invoice: invoiceHTML,
      treatments: "",
      cost: "",
    });

    groupedTimeline[dateKey].events.push({
      title: "Invoice:",
      description: descriptionHTML,
      author: p.collected_by,
      color: "bg-green-600",
      participants: [],
    });
  });

  const sortedGroupedTimeline = Object.values(groupedTimeline).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Accordion section component
  const AccordionSection = ({ title, html }: { title: string; html: string }) => {
    const [open, setOpen] = useState(false);
    if (!html || html.trim() === "") return null;
    return (
      <div className=" rounded-md mb-2">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex justify-between items-center px-3 py-2 bg-gray-100 dark:bg-gray-800 font-semibold"
        >
          {title}
          <span>{open ? "▲" : "▼"}</span>
        </button>
        {open && (
          <div
            className="p-3 text-sm bg-white dark:bg-[#0c1427]"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <div className="trezo-card-header mb-[25px] flex items-center justify-between">
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
                      {group.events.map((event, idx) => {
                        const parsed = JSON.parse(event.description);
                        return (
                          <div key={idx} className="mb-[16px]">
                            {/* <span className="block text-black dark:text-white font-semibold text-lg">
                              {event.title.startsWith("Prescribed by") ? (
                                <a
                                  href={`/doctor-profile/${encodeURIComponent(event.author)}`}
                                  className="text-blue-600 underline"
                                >
                                  {event.title}
                                </a>
                              ) : (
                                event.title
                              )}
                            </span> */}
                            
                            <span className="block text-black dark:text-white font-semibold text-lg">
                              {event.title.startsWith("Prescribed by") ? (
                              <>
                              {/* <a href={`/doctor/view-prescription/${encodeURIComponent(event.prescription_id)}`} className="text-blue-600 underline"> */}
                           <a href={`/doctor/view-prescription/${encodeURIComponent(event.prescription_id || '')}`} className="text-blue-600 underline">
                            Prescribed
                              </a>
                            {" by "}
                            <a
                              href={`/doctor-profile/${encodeURIComponent(event.prescription_id || '')}`}
                              className="text-blue-600 underline"
                              >
                            {event.author}
                            </a>
                              </>
                              ) : (
                              event.title
                            )}
                              </span>
                            

                            <AccordionSection title="Invoice Details" html={parsed.invoice} />
                            <AccordionSection title="Treatments" html={parsed.treatments} />
                            <AccordionSection title="Cost Breakdown" html={parsed.cost} />
                          </div>
                        );
                      })}
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
