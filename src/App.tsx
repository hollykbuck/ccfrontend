import { useState } from "react";
import {
  Button,
  Alert,
  Card,
  Label,
  Checkbox,
  TextInput,
  FileInput,
} from "flowbite-react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Card className="max-w-sm" href="#">
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          <p>Noteworthy technology acquisitions 2021</p>
        </h5>
        <form className="flex max-w-md flex-col gap-4">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="email1" value="Your email" />
            </div>
            <TextInput
              id="email1"
              placeholder="name@flowbite.com"
              required
              type="email"
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="password1" value="Your password" />
            </div>
            <TextInput id="password1" required type="password" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="remember" />
            <Label htmlFor="remember">Remember me</Label>
          </div>
          <div className="max-w-md" id="fileUpload">
            <div className="mb-2 block">
              <Label htmlFor="file" value="Upload file" />
            </div>
            <FileInput
              helperText="A profile picture is useful to confirm your are logged into your account"
              id="file"
            />
          </div>
          <Button type="submit">Submit</Button>
        </form>
      </Card>
    </>
  );
}

export default App;
