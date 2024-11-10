'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCallback, useEffect, useState } from 'react';
import { ShortLinkGenerateRequest } from '@/utils/service';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import LoadingDots from '@/components/ui/loadingdots';
import va from '@vercel/analytics';
import { toast, Toaster } from 'react-hot-toast';
import { ShortLinkData } from '@/utils/service';
import { QRNormal } from 'react-qrbtf';
import { useTrail, a } from '@react-spring/web';



const generateFormSchema = z.object({
  url: z.string().min(1),
});

type GenerateFormValues = z.infer<typeof generateFormSchema>;

function ShortLinkItem({ link }:{link?: string}) {
  const handleCopyClick = () => {
    if (link) {
      navigator.clipboard.writeText(link);
      toast.success('链接已复制到剪切板');
    }
  };

  if (link) {
    return (
      <>
      <div className="flex justify-center items-center gap-2">
        <h3 className="underline text-lg">{link}</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyClick}
          className="ml-2"
        >
         ✂️ 分享
        </Button>
      </div>
      <QRNormal value={link} />
      </>
    );
  } else {
    return <></>;
  }
}


const Body = ({
  redirectUrl,
  shortLink,
}: {
  redirectUrl?: string;
  shortLink?: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [response, setResponse] = useState<ShortLinkData | null>(null);
  const [submittedURL, setSubmittedURL] = useState<string | null>(null);


  const form = useForm<GenerateFormValues>({
    resolver: zodResolver(generateFormSchema),
    mode: 'onChange',

    // Set default values so that the form inputs are controlled components.
    defaultValues: {
      url: '',
    },
  });

  useEffect(() => {
    console.log("useEffect triggered");
    console.log("redirectUrl:", redirectUrl, "shortLink:", shortLink);

    if (redirectUrl && shortLink) {
        console.log("redirectUrl:", redirectUrl, shortLink);
        setResponse({
          url: redirectUrl,
          short_link: shortLink,
        })
        form.setValue('url', redirectUrl);
        setSubmittedURL(shortLink);
    }

  }, [redirectUrl, shortLink, form]);

  const handleSubmit = useCallback(
    async (values: GenerateFormValues) => {
      setIsLoading(true);
      setResponse(null);
      setSubmittedURL(values.url);

      try {
        const request: ShortLinkGenerateRequest = {
          url: values.url,
        };
        const response = await fetch('/api/generate', {
          method: 'POST',
          body: JSON.stringify(request),
        });

        // Handle API errors.
        if (!response.ok || response.status !== 200) {
          const text = await response.text();
          throw new Error(
            `生成二维码失败: ${response.status}, ${text}`,
          );
        }

        const data = await response.json();

        console.log("response data:", data)

        va.track('生成的短链', {
          url: values.url,
        });
        
        setResponse(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const trailDelayIndex = 5;
  const trail = useTrail(trailDelayIndex + 6, {
    config: { mass: 2, tension: 2400, friction: 180 },
    opacity: 1,
    y: 0,
    from: { opacity: 0, y: 50 },
  });

  return (
    <a.div style={trail[trailDelayIndex + 1]}>
    <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20 gap-32">
      <h1 className="sm:text-6xl text-4xl max-w-[708px] font-bold text-slate-900">
        生成短链
      </h1>
      <div className="max-w-xl w-full gap-8">
      <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="flex flex-col gap-8">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-left font-medium"></FormLabel>
                    <FormControl>
                      <Input placeholder="输入原链接" {...field} className="mx-auto" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="inline-flex justify-center mx-auto w-full"
              >
                {isLoading ? <LoadingDots color="white" /> : response ? '✨ 重新生成' : '生成'}
              </Button>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>发生错误</AlertTitle>
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              )}
            </div>
          </form>
        </Form>

      </div>
      <div className="flex justify-center items-center flex-col w-full lg:p-0 p-4 sm:mb-28 mb-0">
        <div>
          {submittedURL && (
            <>
              <h1 className="text-3xl font-bold sm:mb-5 mb-5 mt-5 sm:mt-0 sm:text-center text-left">
                属于你的短链接
              </h1>
              <ShortLinkItem link={response?.short_link} />
            </>
          )}
        </div>
        <Toaster />
      </div>
    </main>
    </a.div>
  );
};

export default Body;
