
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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
  invoice_id: number;
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
    invoice_id?: number;
  }[];
}

interface DateAccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
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

  function getDateTimeKey(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

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


  if (data.patient.onboarded_at) {
    const onboardDateKey = getDateKey(data.patient.onboarded_at);
    if (!groupedTimeline[onboardDateKey]) {
      groupedTimeline[onboardDateKey] = {
        date: onboardDateKey,
        formattedDate: formatDate(data.patient.onboarded_at),
        events: [],
      };
    }
    groupedTimeline[onboardDateKey].events.push({
      title: "Patient Onboarded",
      // Correct the description to be a valid JSON string
      description: JSON.stringify({
        // onboard_message: `Patient ${data.patient.patient_name} was registered in the system at ${getDateTimeKey(data.patient.onboarded_at)}.`,
        onboard_message: `Patient ${data.patient.patient_name} was registered in the system at ${getDateTimeKey(data.patient.onboarded_at)}.`,
        invoice: null,
        treatments: null,
        medicines: null,
        cost: null,
      }),
      author: "System",
      color: "bg-blue-500",
      participants: data.patient.image_url ? [data.patient.image_url] : [],
    });
  }

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
        treatmentsHTML += `<li>• ${t.treatment_name} (Fee: ৳${t.payable_treatment_amount}, Discount: ${t.discount_value}${t.discount_type === "Percentage" ? "%" : ""})</li>`;
      });
      treatmentsHTML += "</ul>";
    }

    if (p.medicine_items.length > 0) {
      medicineHTML += "<ul>";
      p.medicine_items.forEach((m) => {
        medicineHTML += `<li>• ${m.medicine_name} (M-${m.dose_morning}, A-${m.dose_mid_day}, N-${m.dose_night}, ${m.duration_days} days)</li>`;
      });
      medicineHTML += "</ul>";
    }

    if (p.advise && p.advise.trim() !== "") {
      treatmentsHTML += `<p><strong>Advise:</strong> ${p.advise}</p>`;
    }

    costHTML += `<div>- <strong>Treatment Subtotal:</strong> ৳${treatmentSubtotal}</div>`;
    costHTML += `<div>- <strong>Doctor Fee:</strong> ৳${doctorFee}</div>`;
    costHTML += `<div>- <strong>Total Cost:</strong> ৳${p.total_cost}</div>`;

    const descriptionHTML = JSON.stringify({
      invoice: null,
      // treatments: treatmentsHTML + medicineHTML,
      treatments: treatmentsHTML,
      medicines: medicineHTML,
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
        description: JSON.stringify({ invoice: null, treatments: "", medicines: "", cost: "" }),
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
      invoiceHTML += `<div>• <strong>Invoice #:</strong> ${p.invoice_number}</div>`;
      if (p.paid_at) {
        const invoiceDate = new Date(p.paid_at).toISOString().split("T")[0];
        invoiceHTML += `<div>• <strong>Date:</strong> ${invoiceDate}</div>`;
      }
    }
    if (p.previous_due != null) {
      invoiceHTML += `<div>• <strong>Previous Due:</strong> ৳${p.previous_due}</div>`;
    }
    if (p.amount != null) {
      invoiceHTML += `<div>• <strong>Paid Amount:</strong> ৳${p.amount}</div>`;
    }
    if (p.previous_session_date) {
      invoiceHTML += `<div>• <strong>Previous Session Date:</strong> ${p.previous_session_date}</div>`;
    }
    if (p.next_session_date) {
      invoiceHTML += `<div>• <strong>Next Session Date:</strong> ${p.next_session_date}</div>`;
    }
    if (p.due_amount != null) {
      invoiceHTML += `<div>• <strong>Total Due Amount:</strong> ৳${p.due_amount}</div>`;
    }

    const descriptionHTML = JSON.stringify({
      invoice: invoiceHTML,
      treatments: "",
      medicines: "",
      cost: "",
    });

    groupedTimeline[dateKey].events.push({
      title: "Invoice:",
      description: descriptionHTML,
      author: p.collected_by,
      color: "bg-green-600",
      participants: [],
      invoice_id: p.invoice_id,
    });
  });

  const sortedGroupedTimeline = Object.values(groupedTimeline).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  //date accordion
  const DateAccordion = ({ title, children, defaultOpen = false }: DateAccordionProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
      <div className="mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center p-4 text-left font-semibold text-lg bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm"
        >
          {title}
          <span>{isOpen ? '▲' : '▼'}</span>
        </button>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen opacity-100 mt-2' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="p-4 bg-white dark:bg-[#0c1427] rounded-b-lg border border-t-0 border-gray-200 dark:border-gray-700">
            {children}
          </div>
        </div>
      </div>
    );
  };



  // Accordion section component
  //   const AccordionSection = ({ title, html, defaultOpen = false }: { title: string; html: string; defaultOpen?: boolean }) => {
  //   const [open, setOpen] = useState(defaultOpen); // Use the defaultOpen prop here
  //   if (!html || html.trim() === "") return null;
  //   return (
  //     <div className=" rounded-md mb-2">
  //       <button
  //         onClick={() => setOpen(!open)}
  //         className="w-full flex justify-between items-center px-3 py-2 bg-gray-100 dark:bg-gray-800 font-semibold"
  //       >
  //         {title}
  //         <span>{open ? "▲" : "▼"}</span>
  //       </button>
  //       {open && ( // 'open' state is now initialized by defaultOpen
  //         <div
  //           className="p-3 text-sm bg-white dark:bg-[#0c1427]"
  //           dangerouslySetInnerHTML={{ __html: html }}
  //         />
  //       )}
  //     </div>
  //   );
  // };
  const AccordionSection = ({ title, html, defaultOpen = false }: { title: React.ReactNode; html: string; defaultOpen?: boolean }) => {
    const [open, setOpen] = useState(defaultOpen);

    if (!html || html.trim() === "") return null;

    return (
      <div className=" rounded-md mb-2">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex justify-between items-center px-3 py-2 bg-gray-100 dark:bg-gray-800 font-semibold"
        >
          {/* The title can now be a string or a React element */}
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
            Medical History Timeline for <a href={`/view-patient/${encodeURIComponent(data.patient.patient_id || '')}`} >{data.patient.patient_name}</a>
          </h2>
        </div>
        <div className="trezo-card-content pt-[10px] pb-[25px]">
          <div className="relative">
            <span className="block absolute top-0 bottom-0 left-[6px] md:left-[150px] mt-[5px] border-l border-dashed border-gray-100 dark:border-[#172036]"></span>
            {sortedGroupedTimeline.length > 0 ? (
              sortedGroupedTimeline.map((group, index) => (
                <div key={index} className="relative mb-[40px]">
                  <DateAccordion title={group.formattedDate} defaultOpen={index === 0}>
                    {group.events.length > 0 && (
                      <div className="mb-[25px]">
                        {group.events.map((event, idx) => {
                          const parsed = JSON.parse(event.description);
                          const isFirstDateAccordion = index === 0;
                          // Remove Patient Onboarded title and Invoice hyperlink title
                          // Only show event title for prescriptions, not for onboarded or invoice events
                          const showTitle = event.title.startsWith("Prescribed by");
                          return (
                            <div key={idx} className="mb-[16px]">
                              {showTitle && (
                                <span className="block text-black dark:text-white font-semibold text-lg">
                                  <>
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
                                </span>
                              )}
                              {/* Patient Onboarded section: only show accordion, not title */}
                              {parsed.onboard_message && (
                                <AccordionSection title="Patient Onboarded" html={parsed.onboard_message} defaultOpen={isFirstDateAccordion} />
                              )}
                              {/* Invoice Details section: move hyperlink inside accordion if invoice_id exists */}
                              {parsed.invoice && (
                                <AccordionSection
                                  title={
                                    event.invoice_id ? (
                                      <a
                                        href={`/doctor/invoice/view-invoice/${event.invoice_id}`}
                                        className="text-blue-600 underline"
                                      >
                                        Invoice Details
                                      </a>
                                    ) : (
                                      "Invoice Details"
                                    )
                                  }
                                  html={
                                    parsed.invoice
                                  }
                                  defaultOpen={isFirstDateAccordion}
                                />

                              )}
                              <AccordionSection title="Treatments" html={parsed.treatments} defaultOpen={isFirstDateAccordion} />
                              <AccordionSection title="Medicines" html={parsed.medicines} defaultOpen={isFirstDateAccordion} />
                              <AccordionSection title="Cost Breakdown" html={parsed.cost} defaultOpen={isFirstDateAccordion} />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </DateAccordion>
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

