import { TRPCError } from "@trpc/server";
import nodemailer from "nodemailer";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";

const contactInputSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  subject: z.string().min(3).max(120),
  message: z.string().min(10).max(2000),
  phone: z.string().max(30).optional().or(z.literal("")),
  company: z.string().max(100).optional().or(z.literal("")),
});

const smtpEnvSchema = z.object({
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.string().min(1),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().min(1),
  SMTP_TO: z.string().optional(),
  SMTP_SECURE: z.string().optional(),
});

export const contactRouter = router({
  send: publicProcedure.input(contactInputSchema).mutation(async ({ input }) => {
    const envResult = smtpEnvSchema.safeParse(process.env);
    console.log(envResult);
    if (!envResult.success) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "SMTP no está configurado correctamente.",
      });
    }

    const env = envResult.data;
    const port = Number(env.SMTP_PORT);
    if (Number.isNaN(port)) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "El puerto SMTP no es válido.",
      });
    }

    const secure =
      env.SMTP_SECURE === "true" || env.SMTP_SECURE === "1";

    const auth =
      env.SMTP_USER && env.SMTP_PASS
        ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
        : undefined;

    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port,
      secure,
      auth,
    });

    const to = env.SMTP_TO ?? env.SMTP_FROM;
    const subject = `[Contacto] ${input.subject}`;

    const textLines = [
      `Nombre: ${input.name}`,
      `Email: ${input.email}`,
      input.company ? `Empresa: ${input.company}` : null,
      input.phone ? `Teléfono: ${input.phone}` : null,
      "",
      input.message,
    ].filter(Boolean);

    const html = `
      <div style="font-family: Arial, sans-serif; color: #111;">
        <p>Nuevo mensaje de contacto</p>
        <p><strong>Nombre:</strong> ${input.name}</p>
        <p><strong>Email:</strong> ${input.email}</p>
        ${input.company ? `<p><strong>Empresa:</strong> ${input.company}</p>` : ""}
        ${input.phone ? `<p><strong>Teléfono:</strong> ${input.phone}</p>` : ""}
        <hr />
        <p style="white-space: pre-wrap;">${input.message}</p>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: env.SMTP_FROM,
        to,
        replyTo: input.email,
        subject,
        text: textLines.join("\n"),
        html,
      });
    } catch (error) {
      console.log(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "No se pudo enviar el mensaje. Intenta nuevamente.",
      });
    }

    return { ok: true };
  }),
});
