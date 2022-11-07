import { api } from "../services/api";
import { useFormik } from "formik";
import Image from "next/image";
import * as yup from "yup";

import appPreviewImg from "../assets/app-nwl-copa-preview.png";
import iconCheck from "../assets/icon-check.svg";
import avatars from "../assets/avatares.png";
import logoImg from "../assets/logo.svg";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface HomeProps {
  poolCount: number;
  guessCount: number;
  userCount: number;
}

export default function Home(props: HomeProps) {
  const notify = () =>
    toast(
      "Bolão criado com sucesso, o código foi copiado para área de transferência!"
    );

  const validationSchema = yup.object().shape({
    title: yup.string().required("Campo obrigatório"),
  });

  const formik = useFormik({
    onSubmit: async (values, { resetForm }) => {
      const code = api
        .post("/pools", values)
        .then((res: any) => {
          return res.data.code;
        })
        .catch((err) => {
          console.error(err);
        });
      resetForm({});
      await navigator.clipboard.writeText(await code);
      await notify();
    },
    initialValues: { title: "" },
    validationSchema,
  });

  return (
    <div className="h-screen max-w-[1124px] mx-auto my-auto flex items-center gap-8">
      <main>
        <Image src={logoImg} alt="NLW Copa" quality={100} />
        <h1 className="mt-14 text-white text-5xl font-bold leading-tight">
          Crie seu próprio bolão da copa e compartilhe entre amigos!
        </h1>

        <div className="mt-10 flex items-center gap-2 text-gray-50">
          <Image src={avatars} alt="" quality={100} />
          <strong className="text-gray-100 text-xl">
            <span className="text-ignite-500">+{props.userCount} </span>
            pessoas já estão usando
          </strong>
        </div>

        <form className="mt-10 flex gap-2" onSubmit={formik.handleSubmit}>
          <div className="flex flex-col flex-1">
            <input
              type="text"
              className={`px-6 py-4 rounded bg-gray-800 border border-gray-600 text-sm text-gray-100 focus:outline focus:outline-1 focus:outline-gray-800
              ${
                formik.touched.title &&
                formik.errors.title &&
                "border-red-400 focus:outline-red-400"
              }
              `}
              placeholder="Qual nome do seu bolão?"
              id="title"
              name="title"
              value={formik.values.title}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
            />
            <span className="p-2 text-sm text-red-400">
              {formik.touched.title && formik.errors.title}
            </span>
          </div>
          <button
            type="submit"
            disabled={!formik.isValid || formik.isSubmitting}
            className="px-6 rounded bg-yellow-500 text-gray-900 font-bold text-sm uppercase hover:bg-yellow-700 h-[54px]"
          >
            {formik.isSubmitting ? "Carregando..." : "Criar meu bolão"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-300 leading-relaxed">
          Após criar seu bolão, você receberá um código único que poderá usar
          para convidar outras pessoas 🚀
        </p>

        <div className="mt-10 pt-10 border-t border-gray-600  flex text-gray-100 divide-x divide-gray-600">
          <div className="flex flex-1 items-center justify-start gap-6">
            <Image src={iconCheck} alt="ícone de check" quality={100} />
            <div className="flex flex-col ">
              <span className="font-bold text-2xl">+{props.poolCount}</span>
              <span>Bolões criados</span>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-end gap-6">
            <Image src={iconCheck} alt="ícone de check" quality={100} />
            <div className="flex flex-col">
              <span className="font-bold text-2xl">+{props.guessCount}</span>
              <span>Palpites enviados</span>
            </div>
          </div>
        </div>
      </main>
      <Image
        src={appPreviewImg}
        alt="Dois celulares exibindo uma prévia da aplicação móvel do NLW Copa"
        quality={100}
      />
      <ToastContainer />
    </div>
  );
}

export const getServerSideProps = async () => {
  const [poolCountResponse, guessCountResponse, userCountResponse] =
    await Promise.all([
      api.get("/pools/count"),
      api.get("/guesses/count"),
      api.get("/users/count"),
    ]);

  return {
    props: {
      poolCount: poolCountResponse.data.count,
      guessCount: guessCountResponse.data.count,
      userCount: userCountResponse.data.count,
    },
  };
};
