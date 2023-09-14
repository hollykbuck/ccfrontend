import {
  Button,
  Card,
  Label,
  TextInput,
  FileInput,
  Alert,
  Progress,
} from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";
import "./App.css";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";

let BASE = ""
const PRESIGNED_URL = () => {
  return BASE + "/presigned";
}
const SUBMIT_URL = () => {
  return BASE + "/submit";
}

const useRequest = () => {
  const [state, setState] = useState({
    pending: false,
    done: false,
    progress: 0,
    errors: [] as string[],
  });
  const request = useCallback(async (file: File, inputText: string) => {
    const errors: string[] = [];
    if(BASE === "") {
      errors.push("Failed to get config")
      setState({
        pending: false,
        done: false,
        progress: 0,
        errors: errors,
      });
      return;
    }
    let progress = 1;
    setState({
      pending: true,
      done: false,
      progress,
      errors: errors,
    });
    const filename = file.name;
    let text = "";
    try {
      const resp = await fetch(PRESIGNED_URL(), {
        method: "POST",
        body: JSON.stringify({
          filename,
        }),
      });
      if (!resp.ok) {
        throw new Error("Failed to get presigned url");
      }
      text = await resp.text();
      progress = 33;
      setState({
        pending: true,
        done: false,
        progress,
        errors: errors,
      });
    } catch (e) {
      errors.push("Failed to get presigned url");
      setState({
        pending: false,
        done: false,
        progress,
        errors: errors,
      });
      return;
    }
    const data = JSON.parse(text);
    try {
      const putResp = await fetch(data.url, {
        method: "PUT",
        body: await file.arrayBuffer(),
        headers: {
          "content-type": "text/plaintext",
        },
      });
      if (!putResp.ok) {
        throw new Error("Failed to upload file");
      }
      progress = 67;
      setState({
        pending: true,
        done: false,
        progress,
        errors: errors,
      });
    } catch (e) {
      errors.push("Failed to upload file");
      setState({
        pending: false,
        done: false,
        progress,
        errors: errors,
      });
      return;
    }

    try {
      const submitResp = await fetch(SUBMIT_URL(), {
        method: "POST",
        body: JSON.stringify({
          inputText: inputText,
          inputFilePath: filename,
        }),
      });
      if (!submitResp.ok) {
        throw new Error("Failed to submit");
      }
      progress = 100;
      setState({
        pending: true,
        done: false,
        progress,
        errors: errors,
      });
    } catch (e) {
      errors.push("Failed to submit");
      setState({
        pending: false,
        done: false,
        progress,
        errors: errors,
      });
      return;
    }
    setState({
      pending: false,
      done: true,
      progress,
      errors: errors,
    });
  }, []);
  return {
    ...state,
    request,
  } as const;
};

function App() {
  useEffect(() => {
    const run = async() => {
      const resp = await fetch('/config.json', {
        method: 'GET',
      })
      if (!resp.ok) {
        throw new Error('Failed to get config')
      }
      const data = await resp.json()
      BASE = data.url
    }
    if(import.meta.env.DEV) {
      BASE = import.meta.env.BASE_URL
    } else {
      run()      
    }
  }, [])
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { pending, progress, done, errors, request } = useRequest();
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    request(
      fileRef.current?.files?.[0] as File,
      inputRef.current?.value as string
    );
  };
  const alerts = errors.map((v) => {
    return (
      <Alert color="failure" icon={HiInformationCircle}>
        <span>
          <p>
            <span className="font-medium">Error!&nbsp;</span>
            {v}
          </p>
        </span>
      </Alert>
    );
  });
  return (
    <>
      <Card
        className={clsx("max-w-sm", "relative", {
          "opacity-90": pending,
        })}
      >
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          <p>Coding Challenge</p>
        </h5>
        {done && (
          <Alert color="success" icon={HiInformationCircle}>
            <span>
              <p>
                <span className="font-medium">Success!&nbsp;</span>
                Your file has been uploaded
              </p>
            </span>
          </Alert>
        )}
        {alerts}
        <form className="flex max-w-md flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="textinput" value="Text Input" />
            </div>
            <TextInput
              id="textinput"
              placeholder="Write something"
              helperText="This part will be appended to the file"
              required
              type="text"
              disabled={pending}
              ref={inputRef}
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="file" value="Upload file" />
            </div>
            <FileInput
              ref={fileRef}
              helperText="File will be uploaded to S3 directly"
              id="file"
              required
              accept="text/plain"
              disabled={pending}
            />
          </div>
          {progress > 0 && <Progress progress={progress} />}
          <Button type="submit" disabled={pending}>
            Submit
          </Button>
        </form>
        {pending && (
          <div
            role="status"
            className="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2"
          >
            <svg
              aria-hidden="true"
              className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        )}
      </Card>
    </>
  );
}

export default App;
