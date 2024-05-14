import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Container } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const AddRegistrySchema = z.object({
	registryName: z.string().min(1, {
		message: "Registry name is required",
	}),
	username: z.string().min(1, {
		message: "Username is required",
	}),
	password: z.string().min(1, {
		message: "Password is required",
	}),
	registryUrl: z.string().min(1, {
		message: "Registry URL is required",
	}),
	imagePrefix: z.string(),
});

type AddRegistry = z.infer<typeof AddRegistrySchema>;

export const AddRegistry = () => {
	const utils = api.useUtils();
	const [isOpen, setIsOpen] = useState(false);
	const { mutateAsync, error, isError } = api.registry.create.useMutation();
	const { mutateAsync: testRegistry, isLoading } =
		api.registry.testRegistry.useMutation();
	const router = useRouter();
	const form = useForm<AddRegistry>({
		defaultValues: {
			username: "",
			password: "",
			registryUrl: "",
			imagePrefix: "",
			registryName: "",
		},
		resolver: zodResolver(AddRegistrySchema),
	});

	const password = form.watch("password");
	const username = form.watch("username");
	const registryUrl = form.watch("registryUrl");
	const registryName = form.watch("registryName");
	const imagePrefix = form.watch("imagePrefix");

	useEffect(() => {
		form.reset({
			username: "",
			password: "",
			registryUrl: "",
			imagePrefix: "",
		});
	}, [form, form.reset, form.formState.isSubmitSuccessful]);

	const onSubmit = async (data: AddRegistry) => {
		await mutateAsync({
			password: data.password,
			registryName: data.registryName,
			username: data.username,
			registryUrl: data.registryUrl,
			registryType: "cloud",
			imagePrefix: data.imagePrefix,
		})
			.then(async (data) => {
				await utils.registry.all.invalidate();
				toast.success("Registry added");
				setIsOpen(false);
			})
			.catch(() => {
				toast.error("Error to add a registry");
			});
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button>
					<Container className="h-4 w-4" />
					Create Registry
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:m:max-w-lg ">
				<DialogHeader>
					<DialogTitle>Add a external registry</DialogTitle>
					<DialogDescription>
						Fill the next fields to add a external registry.
					</DialogDescription>
				</DialogHeader>
				{isError && (
					<div className="flex flex-row gap-4 rounded-lg bg-red-50 p-2 dark:bg-red-950">
						<AlertTriangle className="text-red-600 dark:text-red-400" />
						<span className="text-sm text-red-600 dark:text-red-400">
							{error?.message}
						</span>
					</div>
				)}
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid w-full gap-4"
					>
						<div className="flex flex-col gap-4">
							<FormField
								control={form.control}
								name="registryName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Registry Name</FormLabel>
										<FormControl>
											<Input placeholder="Registry Name" {...field} />
										</FormControl>

										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="flex flex-col gap-4">
							<FormField
								control={form.control}
								name="username"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Username</FormLabel>
										<FormControl>
											<Input placeholder="Username" {...field} />
										</FormControl>

										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="flex flex-col gap-4">
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input
												placeholder="Password"
												{...field}
												type="password"
											/>
										</FormControl>

										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="flex flex-col gap-4">
							<FormField
								control={form.control}
								name="imagePrefix"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Image Prefix</FormLabel>
										<FormControl>
											<Input {...field} placeholder="Image Prefix" />
										</FormControl>

										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="flex flex-col gap-4">
							<FormField
								control={form.control}
								name="registryUrl"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Registry URL</FormLabel>
										<FormControl>
											<Input
												placeholder="https://aws_account_id.dkr.ecr.us-west-2.amazonaws.com"
												{...field}
											/>
										</FormControl>

										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<DialogFooter className="flex flex-row w-full sm:justify-between gap-4 flex-wrap">
							<Button
								type="button"
								variant={"secondary"}
								isLoading={isLoading}
								onClick={async () => {
									await testRegistry({
										username: username,
										password: password,
										registryUrl: registryUrl,
										registryName: registryName,
										registryType: "cloud",
										imagePrefix: imagePrefix,
									})
										.then((data) => {
											if (data) {
												toast.success("Registry Tested Successfully");
											} else {
												toast.error("Registry Test Failed");
											}
										})
										.catch(() => {
											toast.error("Error to test the registry");
										});
								}}
							>
								Test Registry
							</Button>
							<Button isLoading={form.formState.isSubmitting} type="submit">
								Create
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
