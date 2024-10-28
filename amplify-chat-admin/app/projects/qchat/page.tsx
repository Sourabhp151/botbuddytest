"use client";

import { useState } from "react";
import type { Schema } from "@/amplify/data/resource";
import QChatListRequests from "./components/listRequests";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";

import NewRequest from "./components/newRequest";
import config from "@/amplify_outputs.json";
import { fetchAuthSession } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import { toast } from "sonner";

// generate your data client using the Schema from your backend
//const client = generateClient<Schema>();

export default function Page() {
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState([""]);

  const queryClient = useQueryClient();

  const handleSubmission = async function (payload: any) {
    console.log("handleSubmission called with payload:", payload);
    const id = payload.id;

    setIsSubmitting(true);
    setProgress(30);
    setProgressMessage(["Request Submitted...", ...progressMessage]);
    toast("Request submitted... 👍 ");

    //Trigger Workflow API
    try {
      console.log("Fetching auth session");
      const { accessToken, idToken } = (await fetchAuthSession()).tokens ?? {};
      const endpoint_url = config.custom.apiExecuteStepFnEndpoint;
      console.log("Endpoint URL:", endpoint_url);

      setProgress(60);
      setProgressMessage([
        "Creating Chatbot powered by Amazon Bedrock... ⏳",
        ...progressMessage,
      ]);

      const requestOptions: any = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: idToken,
        },
        body: JSON.stringify(payload),
      };
      console.log("Request options:", requestOptions);

      console.log("Fetching createBRApp");
      const response = await fetch(
        `${endpoint_url}createBRApp`,
        requestOptions
      );
      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);
      setProgress(90);
      setProgressMessage(["Chatbot created successfully", ...progressMessage]);
      const applicationIdQ = data.applicationIdQ;
      const token = data.token;
      const redirectURL = data.publicURL;

      const client = generateClient<Schema>();

      console.log("Updating QChatRequest");
      const respValue = await client.models.QChatRequest.update({
        qchatform_status: "Completed",
        applicationIdQ: applicationIdQ,
        token: redirectURL ? redirectURL : token,
        id: id,
      });
      console.log("Update response:", respValue);

      setProgress(100);
      setProgressMessage(["Updated Completion Status.", ...progressMessage]);
      toast("Application created successfully. 😎");
      setIsCreatingForm(false);
      queryClient.invalidateQueries({ queryKey: ["listQChatRequests"] });
      setProgress(0);
      setProgressMessage([]);
      setIsCreatingForm(false);
      setIsSubmitting(false);
    } catch (err) {
      console.error("Error in handleSubmission:", err);
      toast("❌ An Error has occurred: " + err);
      setProgress(0);
      setProgressMessage([]);
      setIsCreatingForm(false);
      setIsSubmitting(false);
    }
  };

  const handleOnCancel = async function () {
    setIsCreatingForm(false);
  };

  const handleOnSubmitForm = function (payload: any) {
    return false;
  };

  const onClickTestHandler = async function () {};

  const onNewFormRequest = function (): void {
    setIsSubmitting(false);
    setIsCreatingForm(true);
  };
  return (
    <main>
      <div className="hidden md:block sm:text-lg md:text-2xl text-bold bg-blue-600 text-white p-8 rounded-lg w-full mb-4 sm:mb-2 sm:p-2">
        White-labeled Chatbots powered by Amazon Bedrock and Kendra!
      </div>
      {/* <Button onClick={() => handleSubmission({ dummy: "data" })}>
        TESTING
      </Button> */}
      {isCreatingForm ? (
        <>
          <Button variant={"link"} onClick={handleOnCancel} className="m-4">
            ← Go Back
          </Button>
          {isSubmitting ? (
            <>
              <Progress
                className="mt-24 ml-4 w-5/6 items-center "
                value={progress}
              />
              <div className="container items-center mt-12 ml-20">
                {progressMessage.map((msg) => (
                  <p className="text-xl" key={msg}>
                    {msg}
                  </p>
                ))}
              </div>
            </>
          ) : (
            <NewRequest handleSubmission={handleSubmission} />
          )}
        </>
      ) : (
        <QChatListRequests onNewFormRequest={onNewFormRequest} />
      )}
    </main>
  );
}
