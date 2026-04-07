import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";

const ContactsList = () => {
  const [query, setQuery] = useState("");
  const { allContacts, setSelectedUser, getAllContacts } = useChatStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  useEffect(() => {
    const id = setTimeout(async () => {
      try {
        const res = await axiosInstance.get("/messages/contacts", {
          params: { q: query },
        });
        useChatStore.setState({ allContacts: res.data.users || [] });
      } catch (err) {
        toast.error(err.response?.data?.message || "Search failed");
      }
    }, 300);

    return () => clearTimeout(id);
  }, [query]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2 pl-9 pr-3 text-sm text-slate-200 outline-none focus:border-cyan-500"
          placeholder="Search by name, username, email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {allContacts.map((contact) => (
        <button
          key={contact._id}
          className="flex w-full items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/30 p-3 text-left transition hover:border-cyan-500"
          onClick={() => setSelectedUser(contact)}
        >
          {contact.profilePic ? (
            <img src={contact.profilePic} alt={contact.fullname} className="size-10 rounded-full object-cover" />
          ) : (
            <div className="flex size-10 items-center justify-center rounded-full bg-slate-700 text-slate-200">
              {contact.fullname?.[0] || "U"}
            </div>
          )}
          <div>
            <p className="font-medium text-slate-100">{contact.fullname}</p>
            <p className="text-xs text-slate-400">@{contact.username || "member"}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ContactsList;