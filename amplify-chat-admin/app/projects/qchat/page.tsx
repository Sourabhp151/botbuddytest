"use client";

import React, { useState } from "react";
import type { QChatSchema, QChatClient, QChatRequestUpdateInput, QChatPayload, APIResponse } from "./types";
import QChatListRequests from "./components/listRequests";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
// Progress component has its own internal types

import NewRequest from "./components/newRequest";
import config from "@/amplify_outputs.json";
import { fetchAuthSession } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import { toast } from "sonner";

// The client will be instantiated inside the component using useRef





export default function Page() {
  const client = React.useRef(generateClient<QChatSchema>()).current;
  const [isCreatingForm, setIsCreatingForm] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string[]>([""]);

  const queryClient = useQueryClient();

  const handleSubmission = async function (payload: QChatPayload) {
    const id = payload.id;

    setIsSubmitting(true);
    setProgress(30);
    setProgressMessage(["Request Submitted...", ...progressMessage]);
    toast("Request submitted... 👍 ");

    //Trigger Workflow API
    try {
      const { accessToken, idToken } = (await fetchAuthSession()).tokens ?? {};
      const endpoint_url = config.custom.apiExecuteStepFnEndpoint;

      setProgress(60);
      setProgressMessage([
        "Creating Chatbot powered by Amazon Bedrock... ⏳",
        ...progressMessage,
      ]);

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: idToken,
        },
        body: JSON.stringify(payload),
      };

      const response = await fetch(
        `${endpoint_url}createBRApp`,
        requestOptions
      );
      const data = await response.json() as APIResponse;
      setProgress(90);
      setProgressMessage(["Chatbot created successfully", ...progressMessage]);
      const applicationIdQ = data.applicationIdQ;
      const token = data.token;
      const redirectURL = data.publicURL;
      
      // Ensure we have a valid token value
      const finalToken: string = typeof redirectURL === 'string' ? redirectURL : token;

      const updateInput: QChatRequestUpdateInput = {
        id,
        qchatform_status: "Completed" as const,
        applicationIdQ,
        token: finalToken,
      };
      const respValue = await client.models.QChatRequest.update(updateInput);

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
      console.log(err);
      toast("❌ An Error has occurred: " + err);
      setProgress(0);
      setProgressMessage([]);
      setIsCreatingForm(false);
      setIsSubmitting(false);
    }
  };

  const handleOnCancel = async function (): Promise<void> {
    setIsCreatingForm(false);
  };

  const handleOnSubmitForm = function (payload: QChatPayload) {
    return false;
  };

  const onClickTestHandler = async function (): Promise<void> {};

  const onNewFormRequest = function (): void {
    setIsSubmitting(false);
    setIsCreatingForm(true);
  };
  return (
    <main>
      <div className="hidden md:block sm:text-lg md:text-2xl text-bold bg-blue-600 text-white p-8 rounded-lg w-full mb-4 sm:mb-2 sm:p-2">
        BotBuddy - Smart, Fast, and Always Ready to Assist!
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
                className="mt-24 ml-4 w-5/6 items-center"
                value={progress}
                aria-label="Progress"
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
