import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Cake } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import Confetti from "react-confetti";

interface BirthdayCardProps {
  dateOfBirth: Date | string;
  firstName: string;
}

export function BirthdayCard({ dateOfBirth, firstName }: BirthdayCardProps) {
  const [daysUntilBirthday, setDaysUntilBirthday] = useState<number>(0);
  const [showBirthdayDialog, setShowBirthdayDialog] = useState(false);
  const [age, setAge] = useState<number>(0);

  useEffect(() => {
    const calculateBirthday = () => {
      const today = new Date();
      const birth = new Date(dateOfBirth);
      const currentYear = today.getFullYear();

      const ageCalc = currentYear - birth.getFullYear();
      setAge(ageCalc);

      const nextBirthday = new Date(birth);
      nextBirthday.setFullYear(currentYear);

      if (today > nextBirthday) {
        nextBirthday.setFullYear(currentYear + 1);
      }

      const diffTime = nextBirthday.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysUntilBirthday(diffDays);

      const isBirthday =
        today.getMonth() === birth.getMonth() &&
        today.getDate() === birth.getDate();

      if (isBirthday) {
        setShowBirthdayDialog(true);
      }
    };

    calculateBirthday();
    const interval = setInterval(calculateBirthday, 1000 * 60 * 60 * 24);
    return () => clearInterval(interval);
  }, [dateOfBirth]);

  const getBirthdayEmoji = () => {
    if (daysUntilBirthday === 0) return "🎉";
    if (daysUntilBirthday <= 7) return "🎈";
    if (daysUntilBirthday <= 30) return "🎁";
    return "🎂";
  };

  const getBackgroundClass = () => {
    if (daysUntilBirthday === 0)
      return "bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100 dark:from-pink-950 dark:via-purple-950 dark:to-indigo-950";
    if (daysUntilBirthday <= 7)
      return "bg-gradient-to-r from-yellow-100 via-orange-100 to-red-100 dark:from-yellow-950 dark:via-orange-950 dark:to-red-950";
    return "bg-gradient-to-r from-blue-100 via-green-100 to-teal-100 dark:from-blue-950 dark:via-green-950 dark:to-teal-950";
  };

  return (
    <>
      <Card className="w-[264px] h-[282px] overflow-hidden group hover:shadow-lg transition-all duration-300">
        <CardHeader className={getBackgroundClass()}>
          <CardTitle className="flex items-center gap-2">
            <Cake className="w-5 h-5" />
            Birthday Countdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-2 animate-bounce">
              {getBirthdayEmoji()}
            </div>
            {daysUntilBirthday === 0 ? (
              <div className="space-y-2">
                <p className="text-2xl font-bold text-primary">
                  Today is your Birthday! 🎉
                </p>
                <p className="text-lg text-muted-foreground">
                  Happy {age}th Birthday!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-4xl font-bold text-primary">
                  {daysUntilBirthday}
                </p>
                <p className="text-lg text-muted-foreground">
                  {daysUntilBirthday === 1 ? "day" : "days"} until your
                  birthday!
                </p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Born on{" "}
              {new Date(dateOfBirth).toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showBirthdayDialog} onOpenChange={setShowBirthdayDialog}>
        <DialogContent className="sm:max-w-md">
          {showBirthdayDialog && <Confetti />}
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              🎉 Happy Birthday, {firstName}! 🎉
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-8">
            <div className="text-6xl animate-bounce">🎂</div>
            <p className="text-xl text-center">
              Wishing you an amazing {age}th birthday filled with joy, fun, and
              lots of adventures!
            </p>
            <div className="flex gap-4 text-4xl">🎈🎁🎊</div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
