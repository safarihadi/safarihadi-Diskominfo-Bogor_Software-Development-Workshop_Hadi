"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

// Phone number formatting function
const formatPhoneNumber = (phone) => {
  if (!phone) return "";

  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");

  // Remove leading zeros
  cleaned = cleaned.replace(/^0+/, "");

  // If it starts with 62, it's already in international format
  if (cleaned.startsWith("62")) {
    return `+${cleaned}`;
  }

  // For Indonesian mobile numbers, add 62
  if (cleaned.length >= 8 && cleaned.length <= 13) {
    return `+62${cleaned}`;
  }

  // Default: assume it's a mobile number and add 62
  return `+62${cleaned}`;
};

export default function NewSubmission() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      nama: "",
      nik: "",
      email: "",
      no_wa: "",
      jenis_layanan: "",
      consent: false,
    },
  });

  const onSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        no_wa: formatPhoneNumber(values.no_wa),
      };

      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        reset();
        router.push(`/public/success?tracking_code=${result.tracking_code}`);
      } else {
        // eslint-disable-next-line no-console
        console.error(result);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Form Pengajuan Layanan
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Nama */}
        <div>
          <label
            htmlFor="nama"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nama Lengkap *
          </label>
          <input
            type="text"
            id="nama"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${
              errors.nama ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Masukkan nama lengkap"
            {...register("nama", { required: "Nama Lengkap wajib diisi" })}
          />
          {errors.nama && (
            <p className="mt-1 text-sm text-red-600">{errors.nama.message}</p>
          )}
        </div>

        {/* NIK */}
        <div>
          <label
            htmlFor="nik"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            NIK (16 digit) *
          </label>
          <input
            type="text"
            id="nik"
            inputMode="numeric"
            maxLength={16}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${
              errors.nik ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Masukkan 16 digit NIK"
            {...register("nik", {
              required: "NIK wajib diisi",
              pattern: { value: /^\d{16}$/, message: "NIK harus 16 digit angka" },
            })}
            onInput={(e) => {
              // Hanya izinkan angka dan batasi 16 digit
              const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 16);
              if (e.target.value !== digitsOnly) {
                e.target.value = digitsOnly;
              }
            }}
          />
          {errors.nik && (
            <p className="mt-1 text-sm text-red-600">{errors.nik.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email (Opsional)
          </label>
          <input
            type="email"
            id="email"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="contoh@email.com"
            {...register("email", {
              required: "Email wajib diisi",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Format email tidak valid",
              },
            })}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* WhatsApp */}
        <div>
          <label
            htmlFor="no_wa"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nomor WhatsApp *
          </label>
          <input
            type="tel"
            id="no_wa"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${
              errors.no_wa ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="+62812XXXXXXX"
            {...register("no_wa", {
              required: "Nomor WhatsApp wajib diisi",
              pattern: {
                value: /^\+62\d{8,12}$/,
                message:
                  "Nomor WA harus diawali +62 dan hanya angka (min 11 digit total)",
              },
            })}
            onInput={(e) => {
              // Izinkan hanya angka dan tanda + (satu '+' hanya di awal)
              let v = e.target.value.replace(/[^+\d]/g, "");
              // Hapus semua '+' selain yang pertama di awal
              v = v.replace(/(?!^)\+/g, "");
              e.target.value = v;
            }}
          />
          {errors.no_wa && (
            <p className="mt-1 text-sm text-red-600">{errors.no_wa.message}</p>
          )}
        </div>

        {/* Jenis Layanan */}
        <div>
          <label
            htmlFor="jenis_layanan"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Jenis Layanan *
          </label>
          <select
            id="jenis_layanan"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${
              errors.jenis_layanan ? "border-red-500" : "border-gray-300"
            }`}
            defaultValue=""
            {...register("jenis_layanan", { required: "Jenis Layanan wajib dipilih" })}
          >
            <option value="">Pilih jenis layanan</option>
            <option value="KTP">Pembuatan KTP</option>
            <option value="KK">Pembuatan Kartu Keluarga</option>
            <option value="AKTA">Pembuatan Akta Kelahiran</option>
            <option value="SKCK">Pembuatan SKCK</option>
            <option value="SURAT_PINDAH">Surat Pindah</option>
            <option value="SURAT_KETERANGAN">Surat Keterangan</option>
          </select>
          {errors.jenis_layanan && (
            <p className="mt-1 text-sm text-red-600">{errors.jenis_layanan.message}</p>
          )}
        </div>

        {/* Consent */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="consent"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              {...register("consent", { required: "Anda harus menyetujui pemberian notifikasi" })}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="consent" className="text-gray-700">
              Saya setuju untuk menerima notifikasi status pengajuan melalui
              WhatsApp dan email
            </label>
            {errors.consent && (
              <p className="mt-1 text-red-600">{errors.consent.message}</p>
            )}
          </div>
        </div>

        {/* Submit Error */}
        {/* Submit error handled via notifications or console in this example */}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
        >
          {isSubmitting ? "Mengirim..." : "Kirim Pengajuan"}
        </button>
      </form>
    </div>
  );
}
