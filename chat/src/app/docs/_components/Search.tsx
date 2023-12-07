"use client"
import { useTransition, useState, useEffect } from "react";
import { usePathname, useRouter  } from "next/navigation";
import { useSearchParams,  } from "next/navigation";
import {RefreshCw} from 'lucide-react'

export default function SearchField() {
  const [focused, setFocused] = useState(false);
  const {replace} = useRouter();
  const pathname = usePathname();
  const router = useRouter();

  const searchParams = useSearchParams()

  const [isPending, startTransition] = useTransition()

  const handleSearch = (term:string) =>{
    const params = new URLSearchParams(window.location.search)
    if (term){
      params.set("search", term);
    } else{
      params.delete("search");
    }
    params.delete("page")
    startTransition(() =>{
      replace (`${pathname}?${params.toString()}`)
    })    
  }
  useEffect(()=>{
    if (focused){
      const search = searchParams.get('search')

      const href = search ? `/docs?search=${search}`:`/docs`
      router.push(href)
    }
    return
  }, [focused, router, searchParams])

  return (
    <div className="flex justify-center my-2">
      <input
        type="text"
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search..."
        onFocus={()=>setFocused(true)}
        onBlur={()=>setFocused(false)}
        className="border p-1 rounded bg-gray-200"
      />

      {isPending && (
        <div className="absolute right-0 top-0 pr-3 bottom-0 flex items-center justify-center">
          <RefreshCw/>
        </div>
      )}

    </div>
  )

}