"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitAreaReportAction(formData) {
    const userId = formData.get("userId");
    const areaName = formData.get("areaName");
    const description = formData.get("description");
    const isAr = formData.get("lang") === "ar"; 

    if (!areaName || !description) {
    return { error: isAr ? "يرجى ملء جميع الحقول" : "Please fill all fields" };
    }

    try {
    await prisma.areaReport.create({
        data: {
        userId: userId,
        areaName: areaName,
        description: description,
        status: "pending", 
        },
    });

    revalidatePath("/dashboard/organization");
    
    return { 
        success: isAr ? "تم إرسال البلاغ بنجاح" : "Report submitted successfully" 
    };
    } catch (error) {
    console.error("Report Error:", error);
    return { 
        error: isAr ? "حدث خطأ أثناء الإرسال" : "Error while submitting" 
    };
    }
}