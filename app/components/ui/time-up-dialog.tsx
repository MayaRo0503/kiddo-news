import { motion } from "framer-motion";
import { Sun, Moon, Star, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import type { DialogProps } from "@radix-ui/react-dialog";

export default function FunTimeUpDialog({ open, ...props }: DialogProps) {
	return (
		<Dialog open={open} {...props}>
			<DialogContent
				className="max-w-md bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-0 overflow-hidden"
				hideCloseButton
			>
				<DialogTitle className="sr-only">Time&apos;s Up</DialogTitle>
				<motion.div
					initial={{ opacity: 0, scale: 0.5 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5 }}
					className="p-6 text-center"
				>
					<motion.div
						animate={{ rotate: 360 }}
						transition={{
							duration: 2,
							repeat: Number.POSITIVE_INFINITY,
							ease: "linear",
						}}
						className="inline-block mb-4"
					>
						<Clock className="w-16 h-16 text-yellow-300" />
					</motion.div>
					<motion.h2
						initial={{ y: -20 }}
						animate={{ y: 0 }}
						transition={{ type: "spring", stiffness: 300, damping: 10 }}
						className="text-2xl font-bold mb-4 text-white"
					>
						Your time is up for today,
						<br />
						come back tomorrow!
					</motion.h2>
					<div className="flex justify-center space-x-4 mb-4">
						<motion.div
							whileHover={{ scale: 1.2 }}
							whileTap={{ scale: 0.8 }}
							className="focus:outline-none"
						>
							<Sun className="w-8 h-8 text-yellow-300" />
						</motion.div>
						<motion.div
							whileHover={{ scale: 1.2 }}
							whileTap={{ scale: 0.8 }}
							className="focus:outline-none"
						>
							<Moon className="w-8 h-8 text-blue-200" />
						</motion.div>
						<motion.div
							whileHover={{ scale: 1.2 }}
							whileTap={{ scale: 0.8 }}
							className="focus:outline-none"
						>
							<Star className="w-8 h-8 text-yellow-200" />
						</motion.div>
					</div>
					<motion.a
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className="bg-white text-purple-600 px-4 py-2 rounded-full font-bold shadow-lg"
						href="/"
					>
						See you tomorrow!
					</motion.a>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
