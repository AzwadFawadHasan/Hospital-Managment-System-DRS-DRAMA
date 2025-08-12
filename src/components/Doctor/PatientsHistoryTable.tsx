"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";


// import Image from "next/image";
// import Link from "next/link";

interface Patient {
  patient_id: number;
  patient_name: string;
  mobile_number: string;
  email: string;
  date_of_birth: string;
  gender: string;
  age: string;
  blood_group: string;
  weight: string;
  address_line1: string;
  city: string;
  state_province: string;
  postal_code: string;
  emergency_contact_phone: string;
  status: string;
  created_at: string;
  updated_at: string;
  checked?: boolean;
  image_url?: string; // Optional field for patient image URL 
}

const PatientsHistoryTable: React.FC = () => {

  //initialize router
  const router = useRouter();

  //modal state
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  console.log(setSelectedPatient)
  //end modal state
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch("/api/patient/patientlist");
        const data = await res.json();

        if (Array.isArray(data)) {
          const dataWithCheck = data.map((patient: Patient) => ({ ...patient, checked: false }));
          setAllPatients(dataWithCheck);
        } else {
          console.error("Invalid data format:", data);
        }
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    const results = allPatients.filter(
      (patient) =>
        patient.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.mobile_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPatients(results);
    setCurrentPage(1);
  }, [searchTerm, allPatients]);

  const totalItems = filteredPatients.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPatients = filteredPatients.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };


  //  const handleDelete = async (id: number) => {
  //   if (confirm("Are you sure you want to delete this patient?")) {
  //     try {
  //       const res = await fetch(`/api/patient/deletepatient/${id}`, {
  //         method: "DELETE",
  //       });

  //       if (res.ok) {
  //         setAllPatients((prev) => prev.filter((patient) => patient.patient_id !== id));
  //         setFilteredPatients((prev) => prev.filter((patient) => patient.patient_id !== id));
  //       } else {
  //         console.error("Failed to delete patient");
  //       }
  //     } catch (error) {
  //       console.error("Error deleting patient:", error);
  //     }
  //   }
  // }; 


  //view patient details in modal
  // const handleViewClick = async (id: number) => {
  //   try {
  //     // const res = await fetch(`/api/patient/viewpatient/${id}`); // Adjust path based on your route
  //     const res = await fetch(`/api/view-patient-history/${id}`); // Adjust path based on your route
  //     if (!res.ok) throw new Error('Failed to fetch');
  //     const data = await res.json();
  //     setSelectedPatient(data);
  //     setIsOpen(true);
  //   } catch (error) {
  //     console.error("Error fetching patient:", error);
  //   }
  // };



  return (
    <>
      <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
        <div className="trezo-card-header mb-[20px] md:mb-[25px] sm:flex items-center justify-between">
          <div className="trezo-card-title">
            <form className="relative sm:w-[265px]">
              <label className="leading-none absolute ltr:left-[13px] rtl:right-[13px] text-black dark:text-white mt-px top-1/2 -translate-y-1/2">
                <i className="material-symbols-outlined !text-[20px]">search</i>
              </label>
              <input
                type="text"
                placeholder="Search here..."
                className="bg-gray-50 border border-gray-50 h-[36px] text-xs rounded-md w-full block text-black pt-[11px] pb-[12px] ltr:pl-[38px] rtl:pr-[38px] ltr:pr-[13px] ltr:md:pr-[16px] rtl:pl-[13px] rtl:md:pl-[16px] placeholder:text-gray-500 outline-0 dark:bg-[#15203c] dark:text-white dark:border-[#15203c] dark:placeholder:text-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
          </div>


        </div>

        <div className="trezo-card-content">
          <div className="table-responsive overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="whitespace-nowrap uppercase text-[10px] font-bold tracking-[1px] ltr:text-left rtl:text-right pt-0 pb-[12.5px] px-[20px] text-gray-500 dark:text-gray-400 ltr:first:pl-0 rtl:first:pr-0 ltr:last:pr-0 rtl:first:pl-0">
                    <div className="flex items-center gap-[10px]">
                      <div className="form-check relative top-[1.2px]">

                      </div>
                      Patient ID
                    </div>
                  </th>
                  <th className="whitespace-nowrap uppercase text-[10px] font-bold tracking-[1px] ltr:text-left rtl:text-right pt-0 pb-[12.5px] px-[20px] text-gray-500 dark:text-gray-400 ltr:first:pl-0 rtl:first:pr-0 ltr:last:pr-0 rtl:first:pl-0">
                    Patient Name
                  </th>
                  <th className="whitespace-nowrap uppercase text-[10px] font-bold tracking-[1px] ltr:text-left rtl:text-right pt-0 pb-[12.5px] px-[20px] text-gray-500 dark:text-gray-400 ltr:first:pl-0 rtl:first:pr-0 ltr:last:pr-0 rtl:first:pl-0">
                    Email
                  </th>
                  <th className="whitespace-nowrap uppercase text-[10px] font-bold tracking-[1px] ltr:text-left rtl:text-right pt-0 pb-[12.5px] px-[20px] text-gray-500 dark:text-gray-400 ltr:first:pl-0 rtl:first:pr-0 ltr:last:pr-0 rtl:first:pl-0">
                    Phone No.
                  </th>

                  <th className="whitespace-nowrap uppercase text-[10px] font-bold tracking-[1px] ltr:text-left rtl:text-right pt-0 pb-[12.5px] px-[20px] text-gray-500 dark:text-gray-400 ltr:first:pl-0 rtl:first:pr-0 ltr:last:pr-0 rtl:first:pl-0">
                    See History
                  </th>
                </tr>
              </thead>

              <tbody className="text-black dark:text-white">
                {currentPatients.length > 0 ? (
                  currentPatients.map((patient) => (
                    <tr key={patient.patient_id}>
                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[12.5px] ltr:first:pl-0 rtl:first:pr-0 border-b border-primary-50 dark:border-[#172036] ltr:last:pr-0 rtl:last:pl-0">
                        <div className="flex items-center gap-[10px]">

                          <span className="block ms-5 text-xs font-semibold text-gray-600 dark:text-gray-400">
                            {patient.patient_id}
                          </span>
                        </div>
                      </td>
                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[12.5px] ltr:first:pl-0 rtl:first:pr-0 border-b border-primary-50 dark:border-[#172036] ltr:last:pr-0 rtl:last:pl-0">
                        <div className="flex items-center gap-[10px]">
                          <div className="rounded-full w-[35px]">
                            <Image
                              src={patient.image_url || "/uploads/default.avif"}
                              width={35}
                              height={35}
                              className="inline-block rounded-full"
                              alt="user-image"
                            />
                          </div>
                          <span className="font-semibold inline-block">
                            {patient.patient_name}
                          </span>
                        </div>
                      </td>

                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[12.5px] ltr:first:pl-0 rtl:first:pr-0 border-b border-primary-50 dark:border-[#172036] ltr:last:pr-0 rtl:last:pl-0">
                        <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400">
                          {patient?.email}
                        </span>
                      </td>
                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[12.5px] ltr:first:pl-0 rtl:first:pr-0 border-b border-primary-50 dark:border-[#172036] ltr:last:pr-0 rtl:last:pl-0">
                        <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400">
                          {patient.mobile_number}
                        </span>
                      </td>


                      <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[12.5px] ltr:first:pl-0 rtl:first:pr-0 border-b border-primary-50 dark:border-[#172036] ltr:last:pr-0 rtl:last:pl-0">
                        <div className="flex items-center gap-[9px]">
                          {/* View button */}
                          {/* <Link href={`view-patient/${patient.patient_id}`}> */}
                          <button
                            type="button"
                            className="text-primary-500 leading-none custom-tooltip"
                            onClick={() => router.push(`/doctor/patient-history/list/see-patient-history/${patient.patient_id}`)}

                          >
                            <i className="material-symbols-outlined !text-md">visibility</i>
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-4 text-gray-500 dark:text-gray-400"
                    >
                      No patients found matching your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-[12.5px] sm:flex sm:items-center justify-between">
            <p className="!mb-0 !text-xs">
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{" "}
              {totalItems} results
            </p>
            <ol className="mt-[10px] sm:mt-0 flex items-center">
              <li className="inline-block mx-[2px] ltr:first:ml-0 ltr:last:mr-0 rtl:first:mr-0 rtl:last:ml-0">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`w-[31px] h-[31px] block leading-[29px] relative text-center rounded-md border ${currentPage === 1
                      ? "border-gray-200 dark:border-[#172036] text-gray-400 cursor-not-allowed"
                      : "border-gray-100 dark:border-[#172036] hover:bg-primary-500 hover:text-white hover:border-primary-500"
                    }`}
                >
                  <span className="opacity-0">0</span>
                  <i className="material-symbols-outlined left-0 right-0 absolute top-1/2 -translate-y-1/2">
                    chevron_left
                  </i>
                </button>
              </li>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <li
                    key={page}
                    className="inline-block mx-[2px] ltr:first:ml-0 ltr:last:mr-0 rtl:first:mr-0 rtl:last:ml-0"
                  >
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`w-[31px] h-[31px] block leading-[29px] relative text-center rounded-md ${currentPage === page
                          ? "border border-primary-500 bg-primary-500 text-white"
                          : "border border-gray-100 dark:border-[#172036] hover:bg-primary-500 hover:text-white hover:border-primary-500"
                        }`}
                    >
                      {page}
                    </button>
                  </li>
                )
              )}

              <li className="inline-block mx-[2px] ltr:first:ml-0 ltr:last:mr-0 rtl:first:mr-0 rtl:last:ml-0">
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`w-[31px] h-[31px] block leading-[29px] relative text-center rounded-md border ${currentPage === totalPages
                      ? "border-gray-200 dark:border-[#172036] text-gray-400 cursor-not-allowed"
                      : "border-gray-100 dark:border-[#172036] hover:bg-primary-500 hover:text-white hover:border-primary-500"
                    }`}
                >
                  <span className="opacity-0">0</span>
                  <i className="material-symbols-outlined left-0 right-0 absolute top-1/2 -translate-y-1/2">
                    chevron_right
                  </i>
                </button>
              </li>
            </ol>
          </div>
        </div>
      </div>
      {/* view modal */}
      {isOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.4)]">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl relative">
            <button
              className="absolute top-2 right-2 text-xl text-gray-500 hover:text-black"
              onClick={() => setIsOpen(false)}
            >
              &times;
            </button>
            {/* <h2 className="text-2xl font-bold mb-2">Patient Details</h2> */}
            <p className="text-lg font-bold underline">Patient Details:</p>
            <div className="space-y-2 text-sm">
              <Image
                src={selectedPatient.image_url || "/uploads/default.avif"}
                width={100}
                height={100}
                className="inline-block rounded-full"
                alt="user-image"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p><strong>Name:</strong> {selectedPatient?.patient_name}</p>
                  <p><strong>Email:</strong> {selectedPatient?.email}</p>
                  <p><strong>Phone:</strong> {selectedPatient?.mobile_number}</p>
                  <p><strong>Emergency Contact:</strong> {selectedPatient?.emergency_contact_phone}</p>
                  <p><strong>DOB:</strong> {new Date(selectedPatient?.date_of_birth).toLocaleDateString()}</p>
                  <p><strong>Gender:</strong> {selectedPatient?.gender}</p>
                  <p><strong>Age:</strong> {selectedPatient?.age}</p>
                  <p><strong>Blood Group:</strong> {selectedPatient?.blood_group}</p>
                  <p><strong>Weight:</strong> {selectedPatient?.weight}</p>
                  <p><strong>State:</strong> {selectedPatient?.state_province}</p>
                </div>
                <div>

                  <p><strong>Postal Code:</strong> {selectedPatient?.postal_code}</p>
                  <p><strong>Assigns Doctor:</strong> DR. X*</p>
                  <p><strong>Last Visit:</strong> {new Date(selectedPatient?.created_at).toLocaleDateString()}</p>
                  <p><strong>Next Visit:</strong> May 2024*</p>
                  <p><strong>Treatment:</strong> DR. X*</p>
                  <p><strong>Due Amount:</strong> 50000*</p>
                  <p><strong>Paid Amount:</strong> 50000*</p>
                  <p><strong>Status:</strong> {selectedPatient?.status}</p>
                </div>
              </div>

              {/* Add more fields as needed */}
            </div>
          </div>
        </div>
        // view modal

      )}





    </>
  );
};

export default PatientsHistoryTable;
