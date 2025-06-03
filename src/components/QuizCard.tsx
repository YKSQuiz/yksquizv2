
import Link from 'next/link';
import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizCardProps {
  title: string;
  description?: string;
  href: string;
  icon?: LucideIcon;
  imageUrl?: string;
  dataAiHint?: string;
}

const QuizCard: React.FC<QuizCardProps> = ({ title, description, href, icon: Icon, imageUrl, dataAiHint }) => {
  const hasImage = !!imageUrl;

  return (
    <Link href={href} className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl">
      <Card className={cn(
        "h-full flex flex-col group transition-all duration-300 ease-in-out shadow-md rounded-xl",
        "hover:shadow-[0_4px_20px_rgba(168,127,251,0.4)] hover:border-primary hover:scale-[1.02] hover:bg-[linear-gradient(to_right,#f4ebff,#d6c2ff)]"
      )}>
        {hasImage && imageUrl ? (
          <>
            <div className="relative w-40 h-40 overflow-hidden rounded-t-xl mx-auto mt-4">
              <Image
                src={imageUrl}
                alt={title}
                fill={true}
                style={{ objectFit: 'cover' }}
                sizes="160px"
                data-ai-hint={dataAiHint || title.toLowerCase().split(" ").slice(0,2).join(" ")}
                className="rounded-t-xl"
              />
            </div>
             <CardHeader className="pt-2 pb-2 text-center">
              <CardTitle className="font-headline text-xl text-primary group-hover:text-primary-foreground group-hover:bg-primary p-2 rounded-md transition-colors duration-300">
                {title}
              </CardTitle>
            </CardHeader>
            {description && (
               <CardContent className="flex-grow text-center px-4 pb-2">
                <p className="text-xs text-muted-foreground">{description}</p>
              </CardContent>
            )}
            {!description && <div className="flex-grow" />}
          </>
        ) : (
          <>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="font-headline text-xl text-primary group-hover:text-primary-foreground group-hover:bg-primary p-2 rounded-md transition-colors duration-300">
                  {title}
                </CardTitle>
                {Icon && <Icon className="w-10 h-10 text-primary group-hover:rotate-1 group-hover:opacity-80 transition-all duration-300 ease-out mt-1" strokeWidth={1.5} />}
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </CardContent>
          </>
        )}
        <CardFooter className={cn("mt-auto", (hasImage && description) ? "pt-2" : hasImage ? "pt-4" : "")}>
          <Button
            asChild // Temel elemanı değiştirmek için asChild eklendi
            className={cn(
              "group/button w-full justify-center font-semibold",
              "relative overflow-hidden rounded-md px-4 py-2",
              "text-white",
              "bg-[linear-gradient(to_right,#a87ffb,#805ad5)]",
              "transition-all duration-300 ease-in-out",
              "hover:shadow-[0_0_12px_rgba(168,127,251,0.4)] hover:brightness-110",
              "active:scale-[0.98] active:brightness-95"
            )}
          >
            {/* Button içeriği bir span içine alındı */}
            <span>
              Teste Başla
              <ArrowRight
                size={18}
                className="ml-2 transition-transform duration-300 ease-in-out group-hover/button:translate-x-1"
              />
            </span>
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default QuizCard;
