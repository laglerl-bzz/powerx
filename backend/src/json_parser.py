# src/json_parser.py

"""
XML parsing utilities for SDAT and ESL formats.

This module provides functions to parse raw XML strings into structured
Python dicts, validate SDAT entries, and dispatch parsing based on file type.
"""

import xml.etree.ElementTree as ET
from typing import List, Dict, Any


def parse_sdat_file(xml_string: str) -> Dict[str, Any]:
    """
    Parse a single SDAT XML string into a dict.

    Args:
        xml_string: The raw XML content of an SDAT file.

    Returns:
        A dict with keys:
          - 'documentID': the document identifier string
          - 'interval': dict with 'startDateTime' and 'endDateTime'
          - 'resolution': reading resolution as integer
          - 'data': list of {'sequence': int, 'volume': float}
    """
    ns = {"rsm": "http://www.strom.ch"}
    root = ET.fromstring(xml_string)

    document_id = root.findtext(".//rsm:DocumentID", namespaces=ns)
    start = root.findtext(".//rsm:Interval/rsm:StartDateTime", namespaces=ns)
    end = root.findtext(".//rsm:Interval/rsm:EndDateTime", namespaces=ns)
    resolution = int(
        root.findtext(".//rsm:Resolution/rsm:Resolution", default="15", namespaces=ns)
    )

    observations: List[Dict[str, Any]] = []
    for obs in root.findall(".//rsm:Observation", ns):
        seq = obs.findtext("rsm:Position/rsm:Sequence", namespaces=ns)
        volume = obs.findtext("rsm:Volume", namespaces=ns)
        if seq is not None and volume is not None:
            try:
                observations.append({
                    "sequence": int(seq),
                    "volume": float(volume)
                })
            except ValueError:
                # Skip any entries that can’t be cast cleanly
                continue

    return {
        "documentID": document_id,
        "interval": {"startDateTime": start, "endDateTime": end},
        "resolution": resolution,
        "data": observations
    }


def parse_esl_file(xml_string: str) -> Dict[str, Any]:
    """
    Parse a single ESL XML string into a filtered dict.

    Only OBIS codes '1-1:2.8.1', '1-1:2.8.2', '1-1:1.8.1', '1-1:1.8.2'
    will be retained in each month’s data.

    Args:
        xml_string: The raw XML content of an ESL file.

    Returns:
        A dict with key 'esl-data' mapping to a list of entries:
          - 'month': the period end timestamp
          - 'data': list of {'obis': str, 'value': float}
    """
    ALLOWED_OBIS = {"1-1:2.8.1", "1-1:2.8.2", "1-1:1.8.1", "1-1:1.8.2"}
    root = ET.fromstring(xml_string)
    entries: List[Dict[str, Any]] = []

    for timeperiod in root.findall(".//TimePeriod"):
        month = timeperiod.attrib.get("end")
        values: List[Dict[str, Any]] = []
        for valuerow in timeperiod.findall("ValueRow"):
            obis = valuerow.attrib.get("obis")
            val = valuerow.attrib.get("value")
            try:
                value = float(val) if val is not None else None
            except ValueError:
                continue
            if obis in ALLOWED_OBIS and value is not None:
                values.append({"obis": obis, "value": value})
        # Only add entries that have actual data
        if values:
            entries.append({"month": month, "data": values})

    return {"esl-data": entries}


def is_valid_sdat_entry(entry: Dict[str, Any]) -> bool:
    """
    Determine whether a parsed SDAT entry is valid (non-empty).

    Args:
        entry: The dict returned by `parse_sdat_file`.

    Returns:
        True if `documentID`, `startDateTime`, and `endDateTime` are present.
    """
    if not entry.get("documentID"):
        return False
    iv = entry.get("interval", {})
    if not iv.get("startDateTime") or not iv.get("endDateTime"):
        return False
    return True


def convert_input(input_data: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
    """
    Convert a batch of raw file contents based on type to structured data.

    Args:
        input_data: Dict with keys:
          - 'type': either 'sdat' or 'esl'
          - 'files': list of {'filename': str, 'content': str}

    Returns:
        A dict with either:
          - 'sdat-data': list of valid SDAT entries
          - 'esl-data': list of ESL entries

    Raises:
        ValueError: if `input_data['type']` is not 'sdat' or 'esl'.
    """
    result: Dict[str, List[Dict[str, Any]]] = {}
    file_type = input_data.get("type")

    if file_type == "sdat":
        result["sdat-data"] = []
        for file in input_data.get("files", []):
            content = file.get("content")
            if content:
                parsed = parse_sdat_file(content)
                if is_valid_sdat_entry(parsed):
                    result["sdat-data"].append(parsed)

    elif file_type == "esl":
        result["esl-data"] = []
        for file in input_data.get("files", []):
            content = file.get("content")
            if content:
                result["esl-data"].extend(parse_esl_file(content)["esl-data"])

    else:
        raise ValueError(f"Unsupported file type: {file_type}")

    return result
