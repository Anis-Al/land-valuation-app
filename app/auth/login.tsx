import { Form } from 'react-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Login() {
  return (
    <div className="flex flex-col justify-between h-[80vh] lg:h-[100vh] lg:grid lg:grid-cols-2">
      <div className="flex flex-col bg-app-primary gap-10 py-8">
        <div className="grid grow place-content-center place-items-center lg:p-0">
          <img src="/logo-light.webp" className="w-50 lg:w-96" alt="" />
        </div>
      </div>
      <div className="flex flex-col lg:grid place-content-center place-items-center gap-16 pt-16 lg:pt-0">
        <h1 className="text-4xl lg:text-5xl font-extralight lg:block">
          Land Valuation App
        </h1>

        <h2 className="text-2xl lg:text-3xl font-extralight">Login</h2>

        <Form
          className="grid gap-4 w-[100%] max-w-[400px] lg:w-[400px] px-2 lg:p-0"
          method="post"
          reloadDocument
        >
          <Input name="username" placeholder="Username" />
          <Input name="password" type="password" placeholder="Password" />
          <Button type="submit" className="bg-gray-900 cursor-pointer">
            Sign in
          </Button>
        </Form>
      </div>
    </div>
  );
}
