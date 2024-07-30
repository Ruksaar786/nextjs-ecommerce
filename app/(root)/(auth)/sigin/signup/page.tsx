import React from "react";
import { SignUpForm } from "./signup-form";

const SignUpPage = () => {
  return (
    <div className="wrapper ">
      <div className="max-w-sm mx-auto">
        <h1>Signup form</h1>
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUpPage;
