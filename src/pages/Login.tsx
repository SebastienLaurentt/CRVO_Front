import { Label } from "@/components/ui/label";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import CRVOImg from "/public/images/CRVOImg.jpg";
import CRVOLogo from "/public/images/CRVOLogo.png";

import { useState } from "react";
import { BiHide, BiShow } from "react-icons/bi";

import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";

interface LoginResponse {
  token: string;
}

const loginRequest = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  const response = await fetch("https://crvo-back.onrender.com/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Nom d'utilisateur ou mot de passe incorrect.");
  }

  return response.json();
};

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<null | string>(null);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const { login } = useAuth();

  const mutation = useMutation({
    mutationKey: ["login"],
    mutationFn: () => loginRequest(username, password),
    onSuccess: (data) => {
      Cookies.set("token", data.token, { expires: 1 / 24 });

      login();
      navigate("/");
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    mutation.mutate();
  };

  return (
    <div className="flex h-screen flex-col-reverse items-center   text-white md:flex-col xl:mx-32 xl:flex-row xl:gap-x-4 2xl:mx-auto 2xl:max-w-7xl">
      <div className="mt-4 flex w-full flex-col items-center text-foreground md:mb-4 md:mt-0 xl:mb-0 xl:w-1/2 xl:items-start xl:p-8">
        <div className="w-[300px] md:w-[400px]">
          <img
            src={CRVOLogo}
            alt="Logo CRVO"
            className="mb-4 hidden w-24 text-white lg:w-40 xl:flex xl:w-60"
          />
          <div className="mb-6 flex flex-col gap-y-2 text-center xl:text-left">
            <span className="text-lg font-bold lg:text-xl ">
              Connexion à votre espace
            </span>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-y-3 xl:items-start"
          >
            <div className="flex w-full flex-col  space-y-1 xl:items-start">
              <Label htmlFor="username">Nom d&apos;utilisateur</Label>
              <div className="w-full">
                <Input
                  type="username"
                  id="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError(null);
                  }}
                  required
                />
              </div>
            </div>
            <div className="flex w-full flex-col items-center space-y-1 xl:items-start">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative w-full">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center p-2 text-black"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <BiHide /> : <BiShow />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <Button
              className="w-full"
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <span className="flex flex-row gap-x-3">
                  {" "}
                  Connexion en cours <Loader isButtonSize />
                </span>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>
        </div>
      </div>

      <div className="w-full ">
        <img src={CRVOImg} alt="Image de voiture" className="lg:rounded-lg" />
      </div>
    </div>
  );
}
