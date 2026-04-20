CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	"role" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'employee' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "departments_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "employee_advertiser_access" (
	"employee_id" text NOT NULL,
	"advertiser_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_affiliate_access" (
	"employee_id" text NOT NULL,
	"affiliate_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"department_id" text,
	"department" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "advertisers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"company_name" text,
	"email" text NOT NULL,
	"website" text,
	"country" text,
	"account_manager_id" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "advertisers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "affiliates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"company_name" text,
	"email" text NOT NULL,
	"account_manager_id" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "affiliates_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" text PRIMARY KEY NOT NULL,
	"advertiser_id" text NOT NULL,
	"category_id" text,
	"name" text NOT NULL,
	"logo" text,
	"description" text,
	"private_note" text,
	"offer_url" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"visibility" text DEFAULT 'public' NOT NULL,
	"revenue_type" text DEFAULT 'CPA' NOT NULL,
	"default_revenue" numeric(10, 4) DEFAULT '0' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"payout_type" text DEFAULT 'CPA' NOT NULL,
	"default_payout" numeric(10, 4) DEFAULT '0' NOT NULL,
	"target_geo" text,
	"fallback_url" text,
	"allow_multi_conversion" boolean DEFAULT false NOT NULL,
	"postback_type" text DEFAULT 'pixel' NOT NULL,
	"whitelist_postback_referral_domain" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "landing_pages" (
	"id" text PRIMARY KEY NOT NULL,
	"offer_id" text NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"weight" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offer_affiliates" (
	"id" text PRIMARY KEY NOT NULL,
	"offer_id" text NOT NULL,
	"affiliate_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"custom_payout" numeric(10, 4),
	"custom_revenue" numeric(10, 4),
	"approved_at" timestamp,
	"approved_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clicks" (
	"id" text PRIMARY KEY NOT NULL,
	"offer_id" text NOT NULL,
	"affiliate_id" text NOT NULL,
	"advertiser_id" text NOT NULL,
	"landing_page_id" text,
	"ip_address" text,
	"user_agent" text,
	"referer" text,
	"device_type" text,
	"os" text,
	"browser" text,
	"aff_click_id" text,
	"sub_aff_id" text,
	"source" text,
	"is_unique" boolean DEFAULT true NOT NULL,
	"redirect_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversions" (
	"id" text PRIMARY KEY NOT NULL,
	"click_id" text NOT NULL,
	"offer_id" text NOT NULL,
	"affiliate_id" text NOT NULL,
	"advertiser_id" text NOT NULL,
	"event" text DEFAULT 'conversion' NOT NULL,
	"payout" numeric(10, 4) DEFAULT '0' NOT NULL,
	"revenue" numeric(10, 4) DEFAULT '0' NOT NULL,
	"sale_amount" numeric(10, 4),
	"currency" text DEFAULT 'USD' NOT NULL,
	"status" text DEFAULT 'approved' NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"is_duplicate" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_advertiser_access" ADD CONSTRAINT "employee_advertiser_access_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_affiliate_access" ADD CONSTRAINT "employee_affiliate_access_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advertisers" ADD CONSTRAINT "advertisers_account_manager_id_employees_id_fk" FOREIGN KEY ("account_manager_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliates" ADD CONSTRAINT "affiliates_account_manager_id_employees_id_fk" FOREIGN KEY ("account_manager_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_advertiser_id_advertisers_id_fk" FOREIGN KEY ("advertiser_id") REFERENCES "public"."advertisers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_affiliates" ADD CONSTRAINT "offer_affiliates_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_affiliates" ADD CONSTRAINT "offer_affiliates_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_advertiser_id_advertisers_id_fk" FOREIGN KEY ("advertiser_id") REFERENCES "public"."advertisers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_landing_page_id_landing_pages_id_fk" FOREIGN KEY ("landing_page_id") REFERENCES "public"."landing_pages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversions" ADD CONSTRAINT "conversions_click_id_clicks_id_fk" FOREIGN KEY ("click_id") REFERENCES "public"."clicks"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "departments_name_idx" ON "departments" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "emp_adv_access_idx" ON "employee_advertiser_access" USING btree ("employee_id","advertiser_id");--> statement-breakpoint
CREATE UNIQUE INDEX "emp_aff_access_idx" ON "employee_affiliate_access" USING btree ("employee_id","affiliate_id");--> statement-breakpoint
CREATE UNIQUE INDEX "employees_user_id_idx" ON "employees" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "offer_affiliate_idx" ON "offer_affiliates" USING btree ("offer_id","affiliate_id");--> statement-breakpoint
CREATE INDEX "clicks_offer_created_idx" ON "clicks" USING btree ("offer_id","created_at");--> statement-breakpoint
CREATE INDEX "clicks_affiliate_created_idx" ON "clicks" USING btree ("affiliate_id","created_at");--> statement-breakpoint
CREATE INDEX "clicks_advertiser_created_idx" ON "clicks" USING btree ("advertiser_id","created_at");--> statement-breakpoint
CREATE INDEX "conversions_click_idx" ON "conversions" USING btree ("click_id");--> statement-breakpoint
CREATE INDEX "conversions_offer_created_idx" ON "conversions" USING btree ("offer_id","created_at");--> statement-breakpoint
CREATE INDEX "conversions_affiliate_created_idx" ON "conversions" USING btree ("affiliate_id","created_at");