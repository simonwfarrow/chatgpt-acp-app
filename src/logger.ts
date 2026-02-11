/**
 * Structured logging utility for Cloudflare Workers observability.
 * Outputs JSON logs for better filtering and analysis in the dashboard.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
	requestId?: string;
	sessionId?: string;
	method?: string;
	path?: string;
	[key: string]: unknown;
}

export interface LogEntry {
	level: LogLevel;
	event: string;
	message?: string;
	timestamp: string;
	durationMs?: number;
	context?: LogContext;
	request?: {
		method: string;
		url: string;
		headers?: Record<string, string>;
		body?: unknown;
	};
	response?: {
		status: number;
		headers?: Record<string, string>;
		body?: unknown;
	};
	error?: {
		name: string;
		message: string;
		stack?: string;
	};
	[key: string]: unknown;
}

class Logger {
	private context: LogContext = {};

	/**
	 * Create a child logger with additional context
	 */
	child(context: LogContext): Logger {
		const child = new Logger();
		child.context = { ...this.context, ...context };
		return child;
	}

	/**
	 * Set context for this logger instance
	 */
	setContext(context: LogContext): void {
		this.context = { ...this.context, ...context };
	}

	private log(level: LogLevel, event: string, data?: Partial<LogEntry>): void {
		const entry: LogEntry = {
			level,
			event,
			timestamp: new Date().toISOString(),
			...data,
			context: { ...this.context, ...data?.context },
		};

		// Use appropriate console method based on level
		const output = JSON.stringify(entry);
		switch (level) {
			case "error":
				console.error(output);
				break;
			case "warn":
				console.warn(output);
				break;
			case "debug":
				console.debug(output);
				break;
			default:
				console.log(output);
		}
	}

	debug(event: string, data?: Partial<LogEntry>): void {
		this.log("debug", event, data);
	}

	info(event: string, data?: Partial<LogEntry>): void {
		this.log("info", event, data);
	}

	warn(event: string, data?: Partial<LogEntry>): void {
		this.log("warn", event, data);
	}

	error(event: string, data?: Partial<LogEntry>): void {
		this.log("error", event, data);
	}

	/**
	 * Log an incoming HTTP request
	 */
	logRequest(
		request: Request,
		body?: unknown,
		additionalData?: Partial<LogEntry>,
	): void {
		const headers: Record<string, string> = {};
		request.headers.forEach((value, key) => {
			// Redact sensitive headers
			if (key.toLowerCase() === "authorization") {
				headers[key] = "[REDACTED]";
			} else {
				headers[key] = value;
			}
		});

		this.info("http_request_received", {
			request: {
				method: request.method,
				url: request.url,
				headers,
				body,
			},
			...additionalData,
		});
	}

	/**
	 * Log an outgoing HTTP response
	 */
	logResponse(
		status: number,
		body?: unknown,
		durationMs?: number,
		additionalData?: Partial<LogEntry>,
	): void {
		this.info("http_response_sent", {
			response: {
				status,
				body,
			},
			durationMs,
			...additionalData,
		});
	}

	/**
	 * Log an outgoing API request (e.g., to Worldpay)
	 */
	logApiRequest(
		url: string,
		method: string,
		body?: unknown,
		headers?: Record<string, string>,
		additionalData?: Partial<LogEntry>,
	): void {
		// Redact authorization header
		const safeHeaders = headers ? { ...headers } : undefined;
		if (safeHeaders?.Authorization) {
			safeHeaders.Authorization = "[REDACTED]";
		}

		this.info("api_request_sent", {
			request: {
				method,
				url,
				headers: safeHeaders,
				body,
			},
			...additionalData,
		});
	}

	/**
	 * Log an incoming API response (e.g., from Worldpay)
	 */
	logApiResponse(
		url: string,
		status: number,
		body?: unknown,
		durationMs?: number,
		additionalData?: Partial<LogEntry>,
	): void {
		this.info("api_response_received", {
			response: {
				status,
				body,
			},
			durationMs,
			context: { ...this.context, apiUrl: url },
			...additionalData,
		});
	}

	/**
	 * Log MCP tool invocation
	 */
	logToolInvocation(
		toolName: string,
		params: unknown,
		additionalData?: Partial<LogEntry>,
	): void {
		this.info("mcp_tool_invoked", {
			context: { ...this.context, toolName },
			toolParams: params,
			...additionalData,
		});
	}

	/**
	 * Log MCP tool result
	 */
	logToolResult(
		toolName: string,
		result: unknown,
		durationMs?: number,
		additionalData?: Partial<LogEntry>,
	): void {
		this.info("mcp_tool_completed", {
			context: { ...this.context, toolName },
			toolResult: result,
			durationMs,
			...additionalData,
		});
	}

	/**
	 * Log an error with full details
	 */
	logError(
		event: string,
		error: unknown,
		additionalData?: Partial<LogEntry>,
	): void {
		const errorDetails =
			error instanceof Error
				? {
						name: error.name,
						message: error.message,
						stack: error.stack,
					}
				: {
						name: "UnknownError",
						message: String(error),
					};

		this.error(event, {
			error: errorDetails,
			...additionalData,
		});
	}
}

// Export singleton instance
export const logger = new Logger();

// Export class for creating child loggers
export { Logger };
